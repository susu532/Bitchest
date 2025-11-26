<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Cryptocurrency;
use App\Models\CryptoPrice;
use Carbon\Carbon;

class CryptoSeeder extends Seeder
{
    // Constante utilisée pour le modulo dans le générateur de nombres aléatoires (LCG)
    private const MODULUS = 2147483647;
    // Constante multiplicatrice pour le générateur LCG
    private const MULTIPLIER = 48271;

   

    // Méthode principale exécutée lors du seeding
    public function run(): void
    {
        // Définition du tableau des cryptomonnaies à créer
        $cryptocurrencies = [
            [
                'id' => 'bitcoin', // Identifiant unique
                'name' => 'Bitcoin', // Nom affiché
                'symbol' => 'BTC', // Symbole boursier
                'icon' => '/assets/bitcoin.png', // Chemin de l'icône
            ],
            [
                'id' => 'ethereum',
                'name' => 'Ethereum',
                'symbol' => 'ETH',
                'icon' => '/assets/ethereum.png',
            ],
            [
                'id' => 'ripple',
                'name' => 'Ripple',
                'symbol' => 'XRP',
                'icon' => '/assets/ripple.png',
            ],
            [
                'id' => 'bitcoin-cash',
                'name' => 'Bitcoin Cash',
                'symbol' => 'BCH',
                'icon' => '/assets/bitcoin-cash.png',
            ],
            [
                'id' => 'cardano',
                'name' => 'Cardano',
                'symbol' => 'ADA',
                'icon' => '/assets/cardano.png',
            ],
            [
                'id' => 'litecoin',
                'name' => 'Litecoin',
                'symbol' => 'LTC',
                'icon' => '/assets/litecoin.png',
            ],
            [
                'id' => 'nem',
                'name' => 'NEM',
                'symbol' => 'XEM',
                'icon' => '/assets/nem.png',
            ],
            [
                'id' => 'stellar',
                'name' => 'Stellar',
                'symbol' => 'XLM',
                'icon' => '/assets/stellar.png',
            ],
            [
                'id' => 'iota',
                'name' => 'IOTA',
                'symbol' => 'MIOTA',
                'icon' => '/assets/iota.png',
            ],
            [
                'id' => 'dash',
                'name' => 'Dash',
                'symbol' => 'DASH',
                'icon' => '/assets/dash.png',
            ],
        ];

        // Boucle pour créer chaque cryptomonnaie dans la base de données
        foreach ($cryptocurrencies as $crypto) {
            Cryptocurrency::create($crypto); // Création de l'enregistrement
        }

        // Génération de l'historique des prix sur 30 jours
        // Crée une graine de base à partir du début de l'année
        $baseSeed = Carbon::now()->startOfYear()->timestamp;
        // Récupère la date actuelle
        $today = Carbon::now();

        // Pour chaque crypto, on génère son historique
        foreach ($cryptocurrencies as $index => $crypto) {
            // Appel de la méthode de génération avec une graine unique par crypto
            $this->generatePriceHistory($crypto['id'], $crypto['name'], $baseSeed + $index * 97, $today);
        }
    }

    // Méthode privée pour générer l'historique des prix
    private function generatePriceHistory($cryptoId, $name, $seed, $today)
    {
        // Initialisation du générateur aléatoire avec la graine
        $rand = $this->lcg($this->stringToSeed($name) + $seed);
        // Nombre de jours d'historique à générer
        $days = 30;

        // Calcul du prix initial (minimum 5)
        $currentValue = max(5, $this->getFirstCotation($name, $rand));
        // Tableau pour stocker les prix
        $prices = [];

        // Boucle inversée pour aller de J-29 à aujourd'hui
        for ($i = $days - 1; $i >= 0; $i--) {
            // Calcul de la date pour l'itération courante
            $date = (clone $today)->subDays($i);

            // Si ce n'est pas le premier jour, on fait varier le prix
            if (count($prices) > 0) {
                // Calcul du pourcentage de variation
                $deltaPercent = $this->getDailyVariationPercent($name, $rand);
                // Mise à jour du prix actuel (minimum 25)
                $currentValue = max(25, $currentValue * (1 + $deltaPercent));
            }

            // Ajout du prix au tableau des résultats
            $prices[] = [
                'crypto_id' => $cryptoId, // ID de la crypto
                'price_date' => $date->toDateString(), // Date formatée
                'price' => round($currentValue, 2), // Prix arrondi à 2 décimales
                'created_at' => now(), // Date de création
                'updated_at' => now(), // Date de mise à jour
            ];
        }

        // Insertion en masse de tous les prix pour cette crypto
        CryptoPrice::insert($prices);
    }

    // Convertit une chaîne (nom) en un entier pour la graine
    private function stringToSeed($input)
    {
        $hash = 0; // Initialisation du hash
        // Parcourt chaque caractère de la chaîne
        for ($i = 0; $i < strlen($input); $i++) {
            // Formule de hachage simple utilisant le code ASCII
            $hash = ($hash * 31 + ord($input[$i])) % self::MODULUS;
        }
        // Retourne le hash ajusté
        return $hash + (int) (self::MODULUS / 3);
    }

    // Générateur Congruentiel Linéaire (LCG) pour l'aléatoire déterministe
    private function lcg($seed)
    {
        // Retourne une fonction qui capture la variable $seed par référence
        return function () use (&$seed) {
            // Mise à jour de la graine selon la formule LCG
            $seed = ($seed * self::MULTIPLIER) % self::MODULUS;
            // Retourne une valeur normalisée entre 0 et 1
            return ($seed - 1) / (self::MODULUS - 1);
        };
    }

    // Calcule la première cotation basée sur le nom
    private function getFirstCotation($name, $random)
    {
        // Valeur ASCII de la première lettre
        $base = ord($name[0]);
        // Variation aléatoire entre 0 et 10
        $variation = floor($random() * 11);
        // Formule arbitraire pour le prix de départ
        return ($base + $variation) * 450;
    }

    // Calcule le pourcentage de variation quotidienne
    private function getDailyVariationPercent($name, $random)
    {
        // Détermine si la variation est positive (59% de chance)
        $positive = $random() > 0.41;
        // Choisit la première ou dernière lettre pour influencer la volatilité
        $useFirstLetter = $random() > 0.5;
        // Récupère la valeur ASCII de la lettre choisie
        $reference = $useFirstLetter ? ord($name[0]) : ord($name[strlen($name) - 1]);
        // Pourcentage de base entre 1% et 11%
        $percentage = (floor($random() * 10) + 1) * 0.01;
        // Facteur de normalisation basé sur le code ASCII
        $normalized = $reference / 255;
        // Variation finale
        $deltaPercent = $percentage * $normalized;
        // Retourne la variation signée
        return $positive ? $deltaPercent : -$deltaPercent;
    }
}

#Génère des devis sur 30 jours
#Utilise des fonctions pour la génération initiale et quotidienne des prix
#Garantit l'absence de prix négatifs