<?php

// Espace de noms pour les contrôleurs HTTP
namespace App\Http\Controllers;

// Importe le service Wallet qui contient la logique métier
use App\Services\WalletService;
// Importe les FormRequests pour la validation
use App\Http\Requests\BuyCryptoRequest;
use App\Http\Requests\SellCryptoRequest;
// Importe le modèle ClientAccount pour récupérer les informations du compte
use App\Models\ClientAccount;
// Importe la classe Request pour les endpoints qui n'ont pas de FormRequest
use Illuminate\Http\Request;

// Classe contrôleur pour gérer le portefeuille (wallet)
class WalletController extends Controller
{
    /**
     * Instance du service Wallet
     */
    protected WalletService $walletService;
    
    /**
     * Constructeur - injecte le service Wallet
     */
    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }
    /**
     * Permet à un client d'acheter de la cryptomonnaie
     * Endpoint: POST /wallet/buy
     * Authentification: Client uniquement
     * Utilise BuyCryptoRequest pour la validation
     */
    public function buyCryptocurrency(BuyCryptoRequest $request)
    {
        // La validation et l'autorisation sont gérées par BuyCryptoRequest
        // La logique métier est déléguée au WalletService
        $result = $this->walletService->buyCryptocurrency(
            auth()->id(),
            $request->cryptoId,
            $request->quantity,
            $request->pricePerUnit
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Purchase successful',
            'transaction' => $result['transaction'],
            'newBalance' => $result['newBalance'],
        ], 201);
    }

    /**
     * Permet à un client de vendre de la cryptomonnaie
     * Endpoint: POST /wallet/sell
     * Authentification: Client uniquement
     * Utilise SellCryptoRequest pour la validation
     */
    public function sellCryptocurrency(SellCryptoRequest $request)
    {
        // La validation et l'autorisation sont gérées par SellCryptoRequest
        // La logique métier est déléguée au WalletService
        $result = $this->walletService->sellCryptocurrency(
            auth()->id(),
            $request->cryptoId,
            $request->quantity,
            $request->pricePerUnit
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Sale successful',
            'transaction' => $result['transaction'],
            'newBalance' => $result['newBalance'],
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
