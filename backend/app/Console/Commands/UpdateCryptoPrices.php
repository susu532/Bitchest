<?php

// Espace de noms pour l'organisation du code - place cette classe dans le dossier Commands
namespace App\Console\Commands;

// Importe le modèle Cryptocurrency pour accéder aux données des cryptomonnaies
use App\Models\Cryptocurrency;
// Importe le modèle CryptoPrice pour enregistrer les prix historiques
use App\Models\CryptoPrice;
// Importe l'événement CryptoPriceUpdated pour diffuser les mises à jour en temps réel
use App\Events\CryptoPriceUpdated;
// Importe la classe Command de Laravel pour créer des commandes CLI
use Illuminate\Console\Command;
// Importe Carbon pour la manipulation des dates et heures
use Illuminate\Support\Carbon;

// Classe qui étend Command - c'est une commande Laravel artisan
class UpdateCryptoPrices extends Command
{
    // Définit la signature de la commande : php artisan crypto:update-prices {--interval=5}
    protected $signature = 'crypto:update-prices {--interval=5}';

    // Description affichée quand on liste les commandes disponibles
    protected $description = 'Simulate real-time cryptocurrency price updates and broadcast to clients';

    // Cache pour stocker les prix actuels en mémoire (évite les requêtes BD répétées)
    protected array $priceCache = [];

    // Méthode principale exécutée quand la commande est lancée
    public function handle(): int
    {
        // Récupère l'option --interval de la ligne de commande (défaut: 5 secondes)
        $interval = (int) $this->option('interval');

        // Affiche l'en-tête du programme avec formatage visuel
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        // Affiche le titre du programme
        $this->info('🚀 BitChest Cryptocurrency Price Updater');
        // Affiche la séparation visuelle
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        // Affiche une ligne vide pour la lisibilité
        $this->info('');
        // Affiche l'intervalle de mise à jour défini par l'utilisateur
        $this->info('📊 Update Interval: ' . $interval . ' seconds');
        // Affiche le canal de diffusion utilisé pour les mises à jour en temps réel
        $this->info('🔄 Broadcasting to: crypto-prices channel');
        // Affiche une ligne vide
        $this->info('');
        // Affiche l'instruction d'arrêt du programme
        $this->info('Press Ctrl+C to stop');
        // Affiche la séparation finale
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        // Ajoute une nouvelle ligne pour la lisibilité
        $this->newLine();

        // Récupère TOUTES les cryptomonnaies de la base de données
        $cryptos = Cryptocurrency::all();
        // Boucle à travers chaque cryptomonnaie pour initialiser le cache
        foreach ($cryptos as $crypto) {
            // Cherche le prix le plus récent pour cette cryptomonnaie, trié par date descendante
            $latestPrice = CryptoPrice::where('crypto_id', $crypto->id)
                ->orderBy('price_date', 'desc')
                ->first();
            // Stocke le prix dans le cache (100 par défaut si aucun prix n'existe)
            $this->priceCache[$crypto->id] = $latestPrice ? (float) $latestPrice->price : 100;
        }

        // Initialise le compteur de cycles de mise à jour
        $runCount = 0;
        // Initialise le compteur total de diffusions effectuées
        $totalBroadcasts = 0;

        // Boucle infinie qui continuera jusqu'à l'arrêt manuel (Ctrl+C)
        while (true) {
            // Incrémente le numéro du cycle de mise à jour
            $runCount++;
            // Récupère le timestamp actuel formaté pour affichage
            $timestamp = now()->format('Y-m-d H:i:s');

            // Affiche le début d'un nouveau cycle de mise à jour avec son numéro et l'heure
            $this->info("┌─ Update Cycle #{$runCount} [{$timestamp}]");

            // Boucle à travers TOUTES les cryptomonnaies pour mettre à jour leurs prix
            foreach ($cryptos as $crypto) {
                // Récupère le prix actuel de la cache pour cette cryptomonnaie
                $currentPrice = $this->priceCache[$crypto->id];
                // Stocke le prix précédent pour calculer la variation
                $previousPrice = $currentPrice;

                // Génère une variation aléatoire entre -2% et +2% (-20 à 20, divisé par 1000)
                $variation = (rand(-20, 20) / 1000);
                // Calcule le nouveau prix en appliquant la variation au prix actuel
                $newPrice = $currentPrice * (1 + $variation);
                // Arrondit le nouveau prix à 2 décimales (centimes)
                $newPrice = round($newPrice, 2);

                // SÉCURITÉ: Assure que le prix n'est jamais négatif (minimum 5€)
                if ($newPrice < 5) {
                    // Fixe le prix au minimum de 5€
                    $newPrice = 5.00;
                }

                // Met à jour le cache avec le nouveau prix
                $this->priceCache[$crypto->id] = $newPrice;

                // Récupère la date actuelle formatée en Y-m-d (ex: 2025-11-25)
                $today = Carbon::now()->format('Y-m-d');
                // Crée ou met à jour l'enregistrement de prix dans la base de données
                CryptoPrice::updateOrCreate(
                    // Critères de recherche : cherche par crypto_id et price_date
                    [
                        'crypto_id' => $crypto->id,
                        'price_date' => $today,
                    ],
                    // Valeurs à insérer ou mettre à jour
                    [
                        'price' => $newPrice,
                    ]
                );

                // Diffuse l'événement CryptoPriceUpdated aux clients connectés (WebSocket)
                broadcast(new CryptoPriceUpdated(
                    // Identifiant de la cryptomonnaie
                    $crypto->id,
                    // Nouveau prix
                    $newPrice,
                    // Prix précédent pour comparer
                    $previousPrice,
                    // Timestamp ISO 8601 de la mise à jour
                    now()->toIso8601String()
                ));

                // Calcule la différence entre le nouveau et l'ancien prix
                $change = $newPrice - $previousPrice;
                // Calcule le pourcentage de changement (si le prix précédent > 0)
                $changePercent = $previousPrice > 0 ? (($change / $previousPrice) * 100) : 0;

                // Détermine la direction avec emoji (📈 hausse, 📉 baisse)
                $direction = $change >= 0 ? '📈' : '📉';
                // Formate le symbole de la cryptomonnaie avec espaces pour l'alignement
                $cryptoName = strtoupper(str_pad($crypto->symbol, 6));
                // Formate le prix avec le symbole Euro et 2 décimales
                $priceStr = sprintf('€%.2f', $newPrice);
                // Formate le pourcentage de changement avec signe et 4 décimales
                $changeStr = sprintf('%+.4f%%', $changePercent);

                // Affiche la ligne de mise à jour avec tous les détails du prix
                $this->line("│  $direction $cryptoName → $priceStr ($changeStr)");

                // Incrémente le compteur total de diffusions
                $totalBroadcasts++;
            }

            // Affiche la fin du cycle avec le temps d'attente avant le prochain
            $this->info("└─ Waiting $interval seconds...");
            // Ajoute une ligne vide pour la lisibilité
            $this->newLine();

            // Met en pause l'exécution du script pour l'intervalle défini (en secondes)
            sleep($interval);
        }

        // Retourne le code de succès (bien que cette ligne ne soit jamais atteinte avec la boucle infinie)
        return Command::SUCCESS;
    }
}
