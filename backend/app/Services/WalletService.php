<?php
// ============================================================================
// Déclaration du namespace pour le service de portefeuille.
// 'namespace' organise le code dans l'espace App\Services.
// Les Services contiennent la logique métier séparée des contrôleurs.
// ============================================================================
namespace App\Services;

// ============================================================================
// Import du modèle WalletTransaction pour créer des transactions.
// WalletTransaction représente une entrée d'achat ou de vente dans la BD.
// ============================================================================
use App\Models\WalletTransaction;

// ============================================================================
// Import du modèle ClientAccount pour gérer le solde du client.
// ClientAccount contient le solde en euros de chaque client.
// ============================================================================
use App\Models\ClientAccount;

// ============================================================================
// Import des événements pour le broadcasting en temps réel.
// UserBalanceChanged notifie quand le solde d'un utilisateur change.
// TransactionCompleted notifie quand une transaction est terminée.
// ============================================================================
use App\Events\UserBalanceChanged;
use App\Events\TransactionCompleted;

// ============================================================================
// Import des exceptions personnalisées pour la gestion d'erreurs.
// InsufficientBalanceException est lancée si le solde est insuffisant.
// InsufficientCryptoHoldingsException est lancée si pas assez de crypto.
// ============================================================================
use App\Exceptions\InsufficientBalanceException;
use App\Exceptions\InsufficientCryptoHoldingsException;


// ============================================================================
// Déclaration de la classe WalletService contenant la logique métier.
// 'class' définit une classe PHP pour encapsuler les fonctionnalités.
// Ce service gère toutes les opérations d'achat et de vente de crypto.
// ============================================================================
class WalletService
{
    // ============================================================================
    // Méthode buyCryptocurrency pour traiter un achat de cryptomonnaie.
    // 'public function' déclare une méthode accessible publiquement.
    // Les paramètres sont typés : int pour userId, string pour cryptoId, float pour les montants.
    // ': array' indique que la méthode retourne un tableau.
    // ============================================================================
    public function buyCryptocurrency(int $userId, string $cryptoId, float $quantity, float $pricePerUnit): array
    {
        // ============================================================================
        // Récupération du compte client depuis la base de données.
        // ClientAccount::where() construit une requête avec clause WHERE.
        // ->first() retourne le premier résultat trouvé ou null.
        // ============================================================================
        $account = ClientAccount::where('user_id', $userId)->first();
        
        // Calcul du coût total de l'achat.
        $totalCost = $quantity * $pricePerUnit;
        
        // ============================================================================
        // Vérification que le solde est suffisant pour l'achat.
        // Si le solde est inférieur au coût, on lance une exception.
        // throw lance une exception qui interrompt l'exécution normale.
        // ============================================================================
        if ($account->balance_eur < $totalCost) {
            throw new InsufficientBalanceException($totalCost, $account->balance_eur);
        }
        
        // Sauvegarde du solde avant modification pour le broadcasting.
        $previousBalance = $account->balance_eur;
        
        // ============================================================================
        // Création de la transaction d'achat dans la base de données.
        // WalletTransaction::create() insère un nouvel enregistrement.
        // Le tableau associatif contient les colonnes et leurs valeurs.
        // now() retourne la date/heure actuelle (helper Laravel).
        // ============================================================================
        $transaction = WalletTransaction::create([
            'user_id' => $userId,
            'crypto_id' => $cryptoId,
            'quantity' => $quantity,
            'price_per_unit' => $pricePerUnit,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);
        
        // ============================================================================
        // Déduction du montant du solde du compte client.
        // '-=' soustrait la valeur à droite de la propriété.
        // Le nouveau solde est calculé en soustrayant le coût total.
        // ============================================================================
        $account->balance_eur -= $totalCost;
        // save() persiste les modifications dans la base de données.
        $account->save();
        
        // ============================================================================
        // Broadcasting des événements pour le temps réel.
        // broadcast() envoie un événement via les canaux configurés (Pusher/WebSocket).
        // UserBalanceChanged informe le client du changement de solde.
        // TransactionCompleted confirme que la transaction est terminée.
        // ============================================================================
        broadcast(new UserBalanceChanged($userId, $account->balance_eur, $previousBalance, 'Cryptocurrency purchase'));
        broadcast(new TransactionCompleted($userId, 'buy', $cryptoId, $quantity, $pricePerUnit));
        
        // Retour d'un tableau avec la transaction créée et le nouveau solde.
        return [
            'transaction' => $transaction,
            'newBalance' => $account->balance_eur,
        ];
    }
    
    // ============================================================================
    // Méthode sellCryptocurrency pour traiter une vente de cryptomonnaie.
    // Les paramètres sont identiques à buyCryptocurrency.
    // La logique inverse celle de l'achat : on crédite au lieu de débiter.
    // ============================================================================
    public function sellCryptocurrency(int $userId, string $cryptoId, float $quantity, float $pricePerUnit): array
    {
        // Récupération du compte client.
        $account = ClientAccount::where('user_id', $userId)->first();
        
        // ============================================================================
        // Vérification que l'utilisateur possède assez de crypto pour vendre.
        // getHoldingQuantity() calcule la quantité nette détenue.
        // ============================================================================
        $holdingQuantity = $this->getHoldingQuantity($userId, $cryptoId);
        
        // Si la quantité demandée dépasse la quantité détenue, on lance une exception.
        if ($holdingQuantity < $quantity) {
            throw new InsufficientCryptoHoldingsException($cryptoId, $quantity, $holdingQuantity);
        }
        
        // Sauvegarde du solde avant modification.
        $previousBalance = $account->balance_eur;
        
        // Création de la transaction de vente dans la base de données.
        $transaction = WalletTransaction::create([
            'user_id' => $userId,
            'crypto_id' => $cryptoId,
            'quantity' => $quantity,
            'price_per_unit' => $pricePerUnit,
            'type' => 'sell',
            'transaction_date' => now(),
        ]);
        
        // ============================================================================
        // Crédit du montant de la vente au solde du compte.
        // '+=' ajoute la valeur à droite à la propriété.
        // $totalProceeds est le montant reçu de la vente.
        // ============================================================================
        $totalProceeds = $quantity * $pricePerUnit;
        $account->balance_eur += $totalProceeds;
        $account->save();
        
        // Broadcasting des événements en temps réel.
        broadcast(new UserBalanceChanged($userId, $account->balance_eur, $previousBalance, 'Cryptocurrency sale'));
        broadcast(new TransactionCompleted($userId, 'sell', $cryptoId, $quantity, $pricePerUnit));
        
        return [
            'transaction' => $transaction,
            'newBalance' => $account->balance_eur,
        ];
    }
    
    // ============================================================================
    // Méthode privée getHoldingQuantity pour calculer la quantité détenue d'une crypto.
    // 'private' signifie que cette méthode n'est accessible que dans cette classe.
    // Elle agrège les achats et ventes pour obtenir la position nette.
    // ============================================================================
    private function getHoldingQuantity(int $userId, string $cryptoId): float
    {
        // ============================================================================
        // Construction de la requête pour récupérer les transactions.
        // ->where() ajoute des conditions à la requête.
        // ->get() exécute la requête et retourne une collection.
        // ->reduce() agrège les éléments en une seule valeur.
        // ============================================================================
        return WalletTransaction::where('user_id', $userId)
            ->where('crypto_id', $cryptoId)
            ->get()
            // reduce() applique une fonction d'accumulation sur chaque élément.
            // $carry est la valeur accumulée, $transaction est l'élément courant.
            ->reduce(function ($carry, $transaction) {
                // Les achats ajoutent à la quantité, les ventes soustraient.
                return $carry + ($transaction->type === 'buy' ? $transaction->quantity : -$transaction->quantity);
            }, 0); // 0 est la valeur initiale de $carry.
    }
    
    // ============================================================================
    // Méthode getWalletSummary pour récupérer le résumé du portefeuille.
    // Cette méthode calcule les positions agrégées pour toutes les cryptos.
    // ': array' indique que la méthode retourne un tableau.
    // ============================================================================
    public function getWalletSummary(int $userId): array
    {
        // Récupération de toutes les transactions avec eager loading de la crypto.
        $transactions = WalletTransaction::where('user_id', $userId)
            ->with('cryptocurrency')
            ->get();
        
        // Tableau pour stocker les positions par crypto.
        $holdings = [];
        
        // Boucle sur chaque transaction pour agrégation.
        foreach ($transactions as $transaction) {
            // Initialisation de la position si pas encore créée.
            if (!isset($holdings[$transaction->crypto_id])) {
                $holdings[$transaction->crypto_id] = [
                    'cryptoId' => $transaction->crypto_id,
                    'totalQuantity' => 0,
                    'totalCost' => 0,
                    'averagePrice' => 0,
                    'transactions' => [],
                ];
            }
            
            // Mise à jour selon le type de transaction.
            if ($transaction->type === 'buy') {
                $holdings[$transaction->crypto_id]['totalQuantity'] += $transaction->quantity;
                $holdings[$transaction->crypto_id]['totalCost'] += $transaction->quantity * $transaction->price_per_unit;
                
                if ($holdings[$transaction->crypto_id]['totalQuantity'] > 0) {
                    $holdings[$transaction->crypto_id]['averagePrice'] = 
                        $holdings[$transaction->crypto_id]['totalCost'] / $holdings[$transaction->crypto_id]['totalQuantity'];
                }
            } else {
                $holdings[$transaction->crypto_id]['totalQuantity'] -= $transaction->quantity;
                $avgPrice = $holdings[$transaction->crypto_id]['averagePrice'];
                $holdings[$transaction->crypto_id]['totalCost'] -= $transaction->quantity * $avgPrice;
            }
            
            // Ajout de la transaction formatée au tableau.
            $holdings[$transaction->crypto_id]['transactions'][] = [
                'id' => (string) $transaction->id,
                'quantity' => (float) $transaction->quantity,
                'pricePerUnit' => (float) $transaction->price_per_unit,
                'type' => $transaction->type,
                'timestamp' => $transaction->transaction_date->toIso8601String(),
            ];
        }
        
        // Nettoyage des prix moyens pour les positions vides.
        $holdings = array_map(function ($holding) {
            if ($holding['totalQuantity'] <= 0) {
                $holding['averagePrice'] = 0;
            }
            return $holding;
        }, $holdings);
        
        // Retourne uniquement les positions avec quantité positive.
        return array_values(array_filter($holdings, fn($h) => $h['totalQuantity'] > 0));
    }
}

