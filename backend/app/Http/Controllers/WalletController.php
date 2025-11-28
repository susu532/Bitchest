<?php

// Espace de noms pour les contrôleurs HTTP
namespace App\Http\Controllers;

// Importe le modèle WalletTransaction pour gérer les transactions d'achat/vente
use App\Models\WalletTransaction;
// Importe le modèle ClientAccount pour gérer les soldes des clients
use App\Models\ClientAccount;
// Importe le modèle CryptoPrice pour accéder aux prix des cryptos
use App\Models\CryptoPrice;
// Importe l'événement UserBalanceChanged pour notifier les changements de solde
use App\Events\UserBalanceChanged;
// Importe l'événement TransactionCompleted pour notifier les transactions complétées
use App\Events\TransactionCompleted;
// Importe la classe Request pour gérer les requêtes HTTP
use Illuminate\Http\Request;
// Importe les exceptions personnalisées pour une meilleure gestion des erreurs
use App\Exceptions\InsufficientBalanceException;
use App\Exceptions\InsufficientCryptoHoldingsException;
use App\Exceptions\InvalidTransactionException;

// Classe contrôleur pour gérer le portefeuille (wallet) - achats, ventes, résumé
class WalletController extends Controller
{
    /**
     * Permet à un client d'acheter de la cryptomonnaie
     * Endpoint: POST /wallet/buy
     * Authentification: Client uniquement
     * Paramètres requis: cryptoId, quantity, pricePerUnit
     */
    public function buyCryptocurrency(Request $request)
    {
        // Vérifie que l'utilisateur est authentifié ET a le rôle de 'client'
        if (!auth()->check() || auth()->user()->role !== 'client') {
            // Retourne erreur 403 si ce n'est pas un client
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Valide les paramètres de la requête
        $request->validate([
            // cryptoId: obligatoire, chaîne, doit exister dans la table cryptocurrencies
            'cryptoId' => 'required|string|exists:cryptocurrencies,id',
            // quantity: obligatoire, nombre, minimum 0.00000001 (8 décimales)
            'quantity' => 'required|numeric|min:0.00000001',
            // pricePerUnit: obligatoire, nombre, minimum 0.01 (2 décimales)
            'pricePerUnit' => 'required|numeric|min:0.01',
        ]);

        // Récupère l'utilisateur authentifié (le client)
        $user = auth()->user();
        // Récupère le compte client associé à cet utilisateur
        $account = ClientAccount::where('user_id', $user->id)->first();

        // Calcule le coût total de l'achat (quantité × prix par unité)
        $totalCost = $request->quantity * $request->pricePerUnit;

        // Vérifie que le solde EUR du client est suffisant pour l'achat
        if ($account->balance_eur < $totalCost) {
            // Lance une exception personnalisée avec des détails sur le solde
            throw new InsufficientBalanceException($totalCost, $account->balance_eur);
        }

        // Enregistre le solde AVANT la transaction pour calculer le changement
        $previousBalance = $account->balance_eur;

        // Crée un enregistrement de transaction d'achat dans la base de données
        $transaction = WalletTransaction::create([
            // ID du client effectuant l'achat
            'user_id' => $user->id,
            // ID de la cryptomonnaie achetée
            'crypto_id' => $request->cryptoId,
            // Quantité de cryptomonnaie achetée
            'quantity' => $request->quantity,
            // Prix payé par unité
            'price_per_unit' => $request->pricePerUnit,
            // Type de transaction (buy ou sell)
            'type' => 'buy',
            // Timestamp de la transaction
            'transaction_date' => now(),
        ]);

        // Déduit le coût total du solde EUR du client
        $account->balance_eur -= $totalCost;
        // Sauvegarde le nouveau solde dans la base de données
        $account->save();

        // Diffuse l'événement UserBalanceChanged pour notifier les clients connectés
        broadcast(new UserBalanceChanged($user->id, $account->balance_eur, $previousBalance, 'Cryptocurrency purchase'));
        // Diffuse l'événement TransactionCompleted pour notifier de la transaction
        broadcast(new TransactionCompleted($user->id, 'buy', $request->cryptoId, $request->quantity, $request->pricePerUnit));

        // Retourne la réponse JSON avec les détails de la transaction (HTTP 201 = Created)
        return response()->json([
            // Flag de succès
            'success' => true,
            // Message de confirmation
            'message' => 'Purchase successful',
            // Détails de la transaction créée
            'transaction' => [
                // ID unique de la transaction
                'id' => (string) $transaction->id,
                // ID de la cryptomonnaie achetée
                'cryptoId' => $transaction->crypto_id,
                // Quantité achetée
                'quantity' => (float) $transaction->quantity,
                // Prix par unité
                'pricePerUnit' => (float) $transaction->price_per_unit,
                // Type de transaction (buy)
                'type' => $transaction->type,
                // Timestamp en format ISO 8601
                'timestamp' => $transaction->transaction_date->toIso8601String(),
            ],
            // Nouveau solde EUR après l'achat
            'newBalance' => (float) $account->balance_eur,
        ], 201);
    }

    /**
     * Permet à un client de vendre de la cryptomonnaie
     * Endpoint: POST /wallet/sell
     * Authentification: Client uniquement
     * Paramètres requis: cryptoId, quantity, pricePerUnit
     */
    public function sellCryptocurrency(Request $request)
    {
        // Vérifie que l'utilisateur est authentifié ET a le rôle de 'client'
        if (!auth()->check() || auth()->user()->role !== 'client') {
            // Retourne erreur 403 si ce n'est pas un client
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Valide les paramètres de la requête
        $request->validate([
            // cryptoId: obligatoire, chaîne, doit exister dans la table cryptocurrencies
            'cryptoId' => 'required|string|exists:cryptocurrencies,id',
            // quantity: obligatoire, nombre, minimum 0.00000001
            'quantity' => 'required|numeric|min:0.00000001',
            // pricePerUnit: obligatoire, nombre, minimum 0.01
            'pricePerUnit' => 'required|numeric|min:0.01',
        ]);

        // Récupère l'utilisateur authentifié (le client)
        $user = auth()->user();
        // Récupère le compte client associé
        $account = ClientAccount::where('user_id', $user->id)->first();

        // Calcule la quantité totale de cryptomonnaie détenue par le client
        $holdingQuantity = WalletTransaction::where('user_id', $user->id)
            // Filtre par la cryptomonnaie à vendre
            ->where('crypto_id', $request->cryptoId)
            // Récupère TOUTES les transactions pour cette crypto
            ->get()
            // Utilise reduce pour calculer le solde net (buy + sell)
            ->reduce(function ($carry, $transaction) {
                // Ajoute la quantité si achat, la soustrait si vente
                return $carry + ($transaction->type === 'buy' ? $transaction->quantity : -$transaction->quantity);
            }, 0); // Commence à 0

        // Vérifie que le client détient suffisamment de cryptomonnaie pour vendre
        if ($holdingQuantity < $request->quantity) {
            // Lance une exception personnalisée avec des détails sur le holding
            throw new InsufficientCryptoHoldingsException(
                $request->cryptoId,
                $request->quantity,
                $holdingQuantity
            );
        }

        // Enregistre le solde AVANT la transaction pour calculer le changement
        $previousBalance = $account->balance_eur;

        // Crée un enregistrement de transaction de vente dans la base de données
        $transaction = WalletTransaction::create([
            // ID du client effectuant la vente
            'user_id' => $user->id,
            // ID de la cryptomonnaie vendue
            'crypto_id' => $request->cryptoId,
            // Quantité de cryptomonnaie vendue
            'quantity' => $request->quantity,
            // Prix reçu par unité
            'price_per_unit' => $request->pricePerUnit,
            // Type de transaction (sell)
            'type' => 'sell',
            // Timestamp de la transaction
            'transaction_date' => now(),
        ]);

        // Calcule le total des revenus de la vente (quantité × prix par unité)
        $totalProceeds = $request->quantity * $request->pricePerUnit;
        // Ajoute les revenus au solde EUR du client
        $account->balance_eur += $totalProceeds;
        // Sauvegarde le nouveau solde dans la base de données
        $account->save();

        // Diffuse l'événement UserBalanceChanged pour notifier les clients connectés
        broadcast(new UserBalanceChanged($user->id, $account->balance_eur, $previousBalance, 'Cryptocurrency sale'));
        // Diffuse l'événement TransactionCompleted pour notifier de la transaction
        broadcast(new TransactionCompleted($user->id, 'sell', $request->cryptoId, $request->quantity, $request->pricePerUnit));

        // Retourne la réponse JSON avec les détails de la transaction (HTTP 201 = Created)
        return response()->json([
            // Flag de succès
            'success' => true,
            // Message de confirmation
            'message' => 'Sale successful',
            // Détails de la transaction créée
            'transaction' => [
                // ID unique de la transaction
                'id' => (string) $transaction->id,
                // ID de la cryptomonnaie vendue
                'cryptoId' => $transaction->crypto_id,
                // Quantité vendue
                'quantity' => (float) $transaction->quantity,
                // Prix par unité reçu
                'pricePerUnit' => (float) $transaction->price_per_unit,
                // Type de transaction (sell)
                'type' => $transaction->type,
                // Timestamp en format ISO 8601
                'timestamp' => $transaction->transaction_date->toIso8601String(),
            ],
            // Nouveau solde EUR après la vente
            'newBalance' => (float) $account->balance_eur,
        ], 201);
    }

    /**
     * Récupère un résumé complet du portefeuille du client authentifié
     * Endpoint: GET /wallet/summary
     * Authentification: Client uniquement
     * Retourne: solde EUR et liste des holdings avec calculs
     */
    public function getWalletSummary(Request $request)
    {
        // Vérifie que l'utilisateur est authentifié ET a le rôle de 'client'
        if (!auth()->check() || auth()->user()->role !== 'client') {
            // Retourne erreur 403 si ce n'est pas un client
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Récupère l'utilisateur authentifié (le client)
        $user = auth()->user();
        // Récupère le compte client associé
        $account = ClientAccount::where('user_id', $user->id)->first();

        // Vérifie que le compte existe
        if (!$account) {
            // Retourne erreur 404 si le compte n'existe pas
            return response()->json(['success' => false, 'message' => 'Account not found'], 404);
        }

        // Récupère TOUTES les transactions du client avec les relations de cryptomonnaies
        $transactions = WalletTransaction::where('user_id', $user->id)
            // Charge la relation cryptocurrency pour chaque transaction
            ->with('cryptocurrency')
            // Récupère les résultats
            ->get();

        // Initialise un tableau pour grouper les holdings par crypto
        $holdings = [];
        // Boucle à travers chaque transaction pour calculer les holdings
        foreach ($transactions as $transaction) {
            // Vérifie si cette cryptomonnaie n'a pas encore d'entrée dans holdings
            if (!isset($holdings[$transaction->crypto_id])) {
                // Crée une nouvelle entrée pour cette cryptomonnaie
                $holdings[$transaction->crypto_id] = [
                    // ID de la cryptomonnaie
                    'cryptoId' => $transaction->crypto_id,
                    // Quantité totale détenue (calculée en totalisant buy - sell)
                    'totalQuantity' => 0,
                    // Coût total d'achat (utilisé pour calculer le prix moyen)
                    'totalCost' => 0,
                    // Prix moyen pondéré d'achat (Weighted Average Cost)
                    'averagePrice' => 0,
                    // Tableau de toutes les transactions pour cette crypto
                    'transactions' => [],
                ];
            }

            // Si c'est un achat (buy)
            if ($transaction->type === 'buy') {
                // Ajoute la quantité au total
                $holdings[$transaction->crypto_id]['totalQuantity'] += $transaction->quantity;
                // Ajoute le coût (quantité × prix) au coût total
                $holdings[$transaction->crypto_id]['totalCost'] += $transaction->quantity * $transaction->price_per_unit;
                
                // Recalcule le prix moyen après l'achat (Weighted Average Cost)
                if ($holdings[$transaction->crypto_id]['totalQuantity'] > 0) {
                    $holdings[$transaction->crypto_id]['averagePrice'] = 
                        $holdings[$transaction->crypto_id]['totalCost'] / $holdings[$transaction->crypto_id]['totalQuantity'];
                }
            } else {
                // Si c'est une vente (sell)
                // Soustrait la quantité du total
                $holdings[$transaction->crypto_id]['totalQuantity'] -= $transaction->quantity;
                
                // CORRECTION DU BUG: On réduit le coût proportionnellement basé sur le prix moyen d'achat
                // et non pas sur le prix de vente (qui pourrait être plus élevé ou plus bas)
                $avgPrice = $holdings[$transaction->crypto_id]['averagePrice'];
                $holdings[$transaction->crypto_id]['totalCost'] -= $transaction->quantity * $avgPrice;
                
                // Le prix moyen reste inchangé après une vente (principe du coût moyen pondéré)
                // Car on vend au prix moyen d'achat, pas au prix de vente
            }

            // Ajoute les détails de cette transaction au tableau de transactions
            $holdings[$transaction->crypto_id]['transactions'][] = [
                // ID unique de la transaction
                'id' => (string) $transaction->id,
                // Quantité de la transaction
                'quantity' => (float) $transaction->quantity,
                // Prix par unité de la transaction
                'pricePerUnit' => (float) $transaction->price_per_unit,
                // Type de transaction (buy ou sell)
                'type' => $transaction->type,
                // Timestamp en format ISO 8601
                'timestamp' => $transaction->transaction_date->toIso8601String(),
            ];
        }

        // Traite chaque holding pour calculer le prix moyen et filtrer
        $holdings = array_map(function ($holding) {
            // Le prix moyen a déjà été calculé dans la boucle ci-dessus
            // On s'assure juste qu'il est à jour si la quantité est zéro
            if ($holding['totalQuantity'] <= 0) {
                $holding['averagePrice'] = 0;
            }
            // Retourne le holding avec le prix moyen calculé
            return $holding;
        }, $holdings);

        // Filtre les holdings pour ne garder que ceux avec quantité > 0 (exclut les positions fermées)
        $holdings = array_values(array_filter($holdings, fn($h) => $h['totalQuantity'] > 0));

        // Retourne la réponse JSON avec le résumé du portefeuille
        return response()->json([
            // Flag de succès
            'success' => true,
            // Détails du portefeuille
            'wallet' => [
                // Solde EUR actuel du client
                'balanceEUR' => (float) $account->balance_eur,
                // Holdings groupés par cryptomonnaie avec calculs
                'holdings' => $holdings,
            ]
        ]);
    }
}
