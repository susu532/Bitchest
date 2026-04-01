<?php
// ============================================================================
// Déclaration du namespace pour organiser le code selon l'architecture Laravel.
// 'namespace' définit l'espace de noms de cette classe contrôleur.
// App\Http\Controllers indique que c'est un contrôleur dans le dossier Controllers.
// ============================================================================
namespace App\Http\Controllers;

// ============================================================================
// Import du service WalletService pour la logique métier du portefeuille.
// App\Services\WalletService encapsule les opérations d'achat et de vente.
// Ce pattern Service sépare la logique métier du contrôleur.
// ============================================================================
use App\Services\WalletService;

// ============================================================================
// Import des classes de requête personnalisées pour la validation.
// BuyCryptoRequest et SellCryptoRequest valident les données d'entrée.
// Ces classes Form Request centralisent la logique de validation.
// ============================================================================
use App\Http\Requests\BuyCryptoRequest;
use App\Http\Requests\SellCryptoRequest;

// ============================================================================
// Import des modèles nécessaires pour les opérations de portefeuille.
// ClientAccount représente le compte client avec son solde.
// Notification permet de créer des notifications pour l'utilisateur.
// Cryptocurrency représente une cryptomonnaie disponible.
// ============================================================================
use App\Models\ClientAccount;
use App\Models\Notification;
use App\Models\Cryptocurrency;
use App\Models\WalletTransaction;

// ============================================================================
// Import de la classe Request de Laravel pour les requêtes HTTP.
// Illuminate\Http\Request encapsule les données de la requête entrante.
// ============================================================================
use Illuminate\Http\Request;

// ============================================================================
// Déclaration de la classe WalletController pour gérer le portefeuille.
// 'class' définit une nouvelle classe PHP.
// 'extends Controller' hérite du contrôleur de base Laravel.
// Ce contrôleur gère les achats, ventes et consultation du portefeuille.
// ============================================================================
class WalletController extends Controller
{
    // ============================================================================
    // Propriété protégée pour stocker l'instance du service WalletService.
    // 'protected' signifie que la propriété est accessible dans cette classe et ses enfants.
    // WalletService $walletService déclare le type de la propriété (PHP 7.4+).
    // ============================================================================
    protected WalletService $walletService;
    
    // ============================================================================
    // Constructeur du contrôleur avec injection de dépendance.
    // 'public function __construct' est le constructeur appelé à l'instanciation.
    // WalletService $walletService est injecté automatiquement par le conteneur Laravel.
    // L'injection de dépendance permet de découpler le contrôleur du service.
    // ============================================================================
    public function __construct(WalletService $walletService)
    {
        // Assignation du service injecté à la propriété de l'instance.
        $this->walletService = $walletService;
    }
    
    // ============================================================================
    // Méthode buyCryptocurrency pour traiter les achats de cryptomonnaie.
    // BuyCryptoRequest $request est une Form Request avec validation intégrée.
    // La validation est exécutée automatiquement avant l'entrée dans la méthode.
    // ============================================================================
    public function buyCryptocurrency(BuyCryptoRequest $request)
    {
        // ============================================================================
        // Appel du service pour exécuter la logique d'achat.
        // $this->walletService->buyCryptocurrency() délègue au service.
        // auth()->id() retourne l'ID de l'utilisateur actuellement connecté.
        // $request->cryptoId, quantity, pricePerUnit sont les données validées.
        // ============================================================================
        $result = $this->walletService->buyCryptocurrency(
            auth()->id(),
            $request->cryptoId,
            $request->quantity,
            $request->pricePerUnit
        );
        
        // ============================================================================
        // Récupération des informations de la cryptomonnaie pour la notification.
        // Cryptocurrency::find() recherche par clé primaire.
        // $request->cryptoId est l'identifiant de la crypto achetée.
        // ============================================================================
        $crypto = Cryptocurrency::find($request->cryptoId);
        // Calcul du coût total de l'achat.
        $totalCost = $request->quantity * $request->pricePerUnit;
        
        // ============================================================================
        // Création d'une notification pour confirmer l'achat à l'utilisateur.
        // Notification::create() insère un nouvel enregistrement.
        // sprintf() formate le message avec les valeurs dynamiques.
        // %.4f formate un nombre flottant avec 4 décimales.
        // ============================================================================
        Notification::create([
            'user_id' => auth()->id(),
            'type' => 'success',
            'message' => 'Purchase Successful',
            'details' => sprintf(
                'Bought %.4f %s for €%.2f',
                $request->quantity,
                $crypto->name ?? 'crypto',
                $totalCost
            ),
        ]);
        
        // ============================================================================
        // Retour de la réponse JSON avec les détails de la transaction.
        // 201 est le code HTTP pour ressource créée avec succès.
        // $result['transaction'] contient les détails de la transaction créée.
        // $result['newBalance'] contient le nouveau solde après déduction.
        // ============================================================================
        return response()->json([
            'success' => true,
            'message' => 'Purchase successful',
            'transaction' => $result['transaction'],
            'newBalance' => $result['newBalance'],
        ], 201);
    }

    // ============================================================================
    // Méthode sellCryptocurrency pour traiter les ventes de cryptomonnaie.
    // SellCryptoRequest $request valide les données de vente.
    // La méthode suit le même pattern que buyCryptocurrency.
    // ============================================================================
    public function sellCryptocurrency(SellCryptoRequest $request)
    {
        // Appel du service pour exécuter la logique de vente.
        $result = $this->walletService->sellCryptocurrency(
            auth()->id(),
            $request->cryptoId,
            $request->quantity,
            $request->pricePerUnit
        );
        
        // Récupération des informations de la crypto pour la notification.
        $crypto = Cryptocurrency::find($request->cryptoId);
        // Calcul du montant total de la vente.
        $totalEarned = $request->quantity * $request->pricePerUnit;
        
        // Création de la notification de confirmation de vente.
        Notification::create([
            'user_id' => auth()->id(),
            'type' => 'success',
            'message' => 'Sale Successful',
            'details' => sprintf(
                'Sold %.4f %s for €%.2f',
                $request->quantity,
                $crypto->name ?? 'crypto',
                $totalEarned
            ),
        ]);
        
        // Retour de la réponse JSON de succès.
        return response()->json([
            'success' => true,
            'message' => 'Sale successful',
            'transaction' => $result['transaction'],
            'newBalance' => $result['newBalance'],
        ], 201);
    }

    // ============================================================================
    // Méthode getWalletSummary pour récupérer le résumé du portefeuille.
    // Request $request contient les informations de la requête HTTP.
    // Cette méthode calcule les positions et le solde du client.
    // ============================================================================
    public function getWalletSummary(Request $request)
    {
        // ============================================================================
        // Vérification que l'utilisateur est authentifié et est un client.
        // auth()->check() vérifie l'authentification.
        // auth()->user()->role !== 'client' vérifie le rôle.
        // ============================================================================
        if (!auth()->check() || auth()->user()->role !== 'client') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Récupération de l'utilisateur connecté.
        $user = auth()->user();

        // ============================================================================
        // Récupération du compte client associé à l'utilisateur.
        // ClientAccount::where() construit une requête avec condition.
        // ->first() retourne le premier résultat ou null.
        // ============================================================================
        $account = ClientAccount::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Account not found'], 404);
        }

        // ============================================================================
        // Récupération de toutes les transactions de l'utilisateur.
        // WalletTransaction::where() filtre par user_id.
        // ->with('cryptocurrency') charge en avance la relation crypto (eager loading).
        // ->get() exécute la requête et retourne une collection.
        // ============================================================================
        $transactions = WalletTransaction::where('user_id', $user->id)
            ->with('cryptocurrency')
            ->get();

        // Tableau pour stocker les positions agrégées par crypto.
        $holdings = [];

        // ============================================================================
        // Boucle foreach pour parcourir chaque transaction.
        // $transactions as $transaction itère sur la collection.
        // ============================================================================
        foreach ($transactions as $transaction) {
            // Initialisation de la position pour cette crypto si pas encore créée.
            if (!isset($holdings[$transaction->crypto_id])) {
                $holdings[$transaction->crypto_id] = [
                    'cryptoId' => $transaction->crypto_id,
                    'totalQuantity' => 0,
                    'totalCost' => 0,
                    'averagePrice' => 0,
                    'transactions' => [],
                ];
            }

            // ============================================================================
            // Mise à jour des totaux selon le type de transaction.
            // Pour les achats : on ajoute la quantité et le coût.
            // Pour les ventes : on soustrait la quantité et ajuste le coût.
            // ============================================================================
            if ($transaction->type === 'buy') {
                $holdings[$transaction->crypto_id]['totalQuantity'] += $transaction->quantity;
                $holdings[$transaction->crypto_id]['totalCost'] += $transaction->quantity * $transaction->price_per_unit;
                
                // Calcul du prix moyen si la quantité est positive.
                if ($holdings[$transaction->crypto_id]['totalQuantity'] > 0) {
                    $holdings[$transaction->crypto_id]['averagePrice'] = 
                        $holdings[$transaction->crypto_id]['totalCost'] / $holdings[$transaction->crypto_id]['totalQuantity'];
                }
            } else {
                // Pour une vente, on réduit la quantité et le coût proportionnellement.
                $holdings[$transaction->crypto_id]['totalQuantity'] -= $transaction->quantity;
                
                $avgPrice = $holdings[$transaction->crypto_id]['averagePrice'];
                $holdings[$transaction->crypto_id]['totalCost'] -= $transaction->quantity * $avgPrice;
            }

            // ============================================================================
            // Ajout de la transaction au tableau des transactions de cette crypto.
            // Chaque transaction est formatée avec ses propriétés essentielles.
            // ============================================================================
            $holdings[$transaction->crypto_id]['transactions'][] = [
                'id' => (string) $transaction->id,
                'quantity' => (float) $transaction->quantity,
                'pricePerUnit' => (float) $transaction->price_per_unit,
                'type' => $transaction->type,
                'timestamp' => $transaction->transaction_date->toIso8601String(),
            ];
        }

        // ============================================================================
        // Nettoyage des positions avec quantité négative ou nulle.
        // array_map applique une fonction à chaque élément.
        // Si totalQuantity <= 0, on remet averagePrice à 0.
        // ============================================================================
        $holdings = array_map(function ($holding) {
            if ($holding['totalQuantity'] <= 0) {
                $holding['averagePrice'] = 0;
            }
            return $holding;
        }, $holdings);

        // ============================================================================
        // Filtrage pour ne garder que les positions avec quantité positive.
        // array_filter garde les éléments pour lesquels la callback retourne true.
        // array_values réindexe le tableau numériquement.
        // ============================================================================
        $holdings = array_values(array_filter($holdings, fn($h) => $h['totalQuantity'] > 0));

        // Retour du résumé du portefeuille en JSON.
        return response()->json([
            'success' => true,
            'wallet' => [
                'balanceEUR' => (float) $account->balance_eur,
                'holdings' => $holdings,
            ]
        ]);
    }
}

