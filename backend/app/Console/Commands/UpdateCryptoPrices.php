<?php
// ============================================================================
// Déclaration du namespace pour la commande Artisan.
// 'namespace' organise le code dans l'espace App\Console\Commands.
// Les Commands sont des commandes CLI exécutables via php artisan.
// ============================================================================
namespace App\Console\Commands;

// ============================================================================
// Import du modèle Cryptocurrency pour accéder aux cryptomonnaies.
// Cryptocurrency représente une cryptomonnaie dans la base de données.
// ============================================================================
use App\Models\Cryptocurrency;

// ============================================================================
// Import du modèle CryptoPrice pour stocker l'historique des prix.
// CryptoPrice stocke le prix journalier de chaque crypto.
// ============================================================================
use App\Models\CryptoPrice;

// ============================================================================
// Import de l'événement CryptoPriceUpdated pour le broadcasting.
// Cet événement notifie les clients web des changements de prix en temps réel.
// ============================================================================
use App\Events\CryptoPriceUpdated;

// ============================================================================
// Import de la classe Command comme base pour les commandes Artisan.
// Illuminate\Console\Command fournit les méthodes pour créer des commandes CLI.
// ============================================================================
use Illuminate\Console\Command;

// ============================================================================
// Import de Carbon pour la manipulation des dates.
// Illuminate\Support\Carbon étend la bibliothèque Carbon pour Laravel.
// ============================================================================
use Illuminate\Support\Carbon;

// ============================================================================
// Déclaration de la classe UpdateCryptoPrices pour la commande de mise à jour.
// 'class' définit une nouvelle classe PHP.
// 'extends Command' hérite des fonctionnalités des commandes Artisan.
// ============================================================================
class UpdateCryptoPrices extends Command
{
    // ============================================================================
    // Propriété $signature définissant la signature de la commande.
    // 'protected' restreint l'accès à cette classe et ses enfants.
    // 'crypto:update-prices' est le nom de la commande (php artisan crypto:update-prices).
    // '{--interval=5}' définit une option avec valeur par défaut de 5 secondes.
    // ============================================================================
    protected $signature = 'crypto:update-prices {--interval=5}';

    // ============================================================================
    // Propriété $description décrivant la commande.
    // Cette description s'affiche dans php artisan list.
    // ============================================================================
    protected $description = 'Simulate real-time cryptocurrency price updates and broadcast to clients';

    // ============================================================================
    // Propriété $priceCache pour stocker les prix en mémoire.
    // 'protected array' définit un tableau typé.
    // Ce cache évite les requêtes répétées à la base de données.
    // ============================================================================
    protected array $priceCache = [];

    // ============================================================================
    // Méthode handle exécutée quand la commande est lancée.
    // 'public function' déclare une méthode publique.
    // ': int' indique que la méthode retourne un code de sortie entier.
    // ============================================================================
    public function handle(): int
    {
        // ============================================================================
        // Récupération de l'option d'intervalle depuis les arguments.
        // $this->option('interval') récupère la valeur de l'option --interval.
        // (int) convertit la valeur en entier.
        // ============================================================================
        $interval = (int) $this->option('interval');

        // ============================================================================
        // Affichage des informations de démarrage dans la console.
        // $this->info() affiche un message en vert.
        // $this->newLine() ajoute une ligne vide.
        // ============================================================================
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('🚀 BitChest Cryptocurrency Price Updater');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('');
        $this->info('📊 Update Interval: ' . $interval . ' seconds');
        $this->info('🔄 Broadcasting to: crypto-prices channel');
        $this->info('');
        $this->info('Press Ctrl+C to stop');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->newLine();

        // ============================================================================
        // Récupération de toutes les cryptomonnaies depuis la base de données.
        // Cryptocurrency::all() retourne une collection de tous les enregistrements.
        // ============================================================================
        $cryptos = Cryptocurrency::all();

        // ============================================================================
        // Initialisation du cache des prix avec les derniers prix connus.
        // foreach itère sur chaque cryptomonnaie.
        // ============================================================================
        foreach ($cryptos as $crypto) {
            // ============================================================================
            // Récupération du dernier prix enregistré pour cette crypto.
            // CryptoPrice::where() filtre par crypto_id.
            // ->orderBy('price_date', 'desc') trie par date décroissante (plus récent en premier).
            // ->first() récupère le premier résultat (le plus récent).
            // ============================================================================
            $latestPrice = CryptoPrice::where('crypto_id', $crypto->id)
                ->orderBy('price_date', 'desc')
                ->first();

            // ============================================================================
            // Stockage du prix dans le cache, avec 100 comme valeur par défaut.
            // L'opérateur ternaire ?: retourne la valeur si elle existe, sinon le défaut.
            // (float) convertit le prix en nombre flottant.
            // ============================================================================
            $this->priceCache[$crypto->id] = $latestPrice ? (float) $latestPrice->price : 100;
        }

        // Compteurs pour les statistiques d'exécution.
        $runCount = 0;
        $totalBroadcasts = 0;

        // ============================================================================
        // Boucle infinie pour la mise à jour continue des prix.
        // 'while (true)' crée une boucle qui ne s'arrête jamais (sauf Ctrl+C).
        // Cette boucle simule un flux de données en temps réel.
        // ============================================================================
        while (true) {
            $runCount++;
            // Formatage du timestamp pour l'affichage.
            $timestamp = now()->format('Y-m-d H:i:s');
            $this->info("┌─ Update Cycle #{$runCount} [{$timestamp}]");

            // Boucle sur chaque cryptomonnaie pour mettre à jour son prix.
            foreach ($cryptos as $crypto) {
                // Récupération du prix actuel depuis le cache.
                $currentPrice = $this->priceCache[$crypto->id];
                $previousPrice = $currentPrice;

                // ============================================================================
                // Calcul de la variation aléatoire du prix (entre -2% et +2%).
                // rand(-20, 20) génère un nombre entre -20 et 20.
                // Division par 1000 donne une variation entre -0.02 et +0.02.
                // ============================================================================
                $variation = (rand(-20, 20) / 1000);

                // ============================================================================
                // Application de la variation au prix actuel.
                // (1 + $variation) crée un multiplicateur (ex: 0.98 ou 1.02).
                // round($newPrice, 2) arrondit à 2 décimales.
                // ============================================================================
                $newPrice = $currentPrice * (1 + $variation);
                $newPrice = round($newPrice, 2);

                // Empêche le prix de descendre en dessous de 5€.
                if ($newPrice < 5) {
                    $newPrice = 5.00;
                }

                // Mise à jour du cache avec le nouveau prix.
                $this->priceCache[$crypto->id] = $newPrice;

                // Récupération de la date du jour au format Y-m-d.
                $today = Carbon::now()->format('Y-m-d');

                // ============================================================================
                // Mise à jour ou création du prix dans la base de données.
                // updateOrCreate() cherche un enregistrement correspondant aux critères.
                // Si trouvé, il le met à jour; sinon, il en crée un nouveau.
                // Premier tableau: critères de recherche (crypto_id + date).
                // Second tableau: valeurs à mettre à jour ou créer.
                // ============================================================================
                CryptoPrice::updateOrCreate(
                    [
                        'crypto_id' => $crypto->id,
                        'price_date' => $today,
                    ],
                    [
                        'price' => $newPrice,
                    ]
                );

                // ============================================================================
                // Broadcasting de l'événement de mise à jour de prix.
                // broadcast() envoie l'événement via les canaux configurés (Pusher/Redis).
                // CryptoPriceUpdated contient l'ID crypto, le nouveau prix, l'ancien, et l'horodatage.
                // Les clients WebSocket reçoivent cet événement en temps réel.
                // ============================================================================
                broadcast(new CryptoPriceUpdated(
                    $crypto->id,
                    $newPrice,
                    $previousPrice,
                    now()->toIso8601String()
                ));

                // Calcul de la variation en valeur et en pourcentage.
                $change = $newPrice - $previousPrice;
                $changePercent = $previousPrice > 0 ? (($change / $previousPrice) * 100) : 0;

                // Choix de l'emoji selon la direction du changement.
                $direction = $change >= 0 ? '📈' : '📉';

                // Formatage pour l'affichage console.
                $cryptoName = strtoupper(str_pad($crypto->symbol, 6));
                $priceStr = sprintf('€%.2f', $newPrice);
                $changeStr = sprintf('%+.4f%%', $changePercent);

                // Affichage de la mise à jour dans la console.
                $this->line("│  $direction $cryptoName → $priceStr ($changeStr)");

                $totalBroadcasts++;
            }

            // Message indiquant l'attente avant le prochain cycle.
            $this->info("└─ Waiting $interval seconds...");
            $this->newLine();

            // ============================================================================
            // Pause avant le prochain cycle de mise à jour.
            // sleep($interval) suspend l'exécution pendant $interval secondes.
            // ============================================================================
            sleep($interval);
        }

        // Code de sortie réussi (jamais atteint à cause de la boucle infinie).
        return Command::SUCCESS;
    }
}

