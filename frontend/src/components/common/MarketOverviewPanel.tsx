// ============================================================================
// Import des hooks React pour l'état et la mémoisation.
// useMemo calcule des valeurs dérivées uniquement quand les dépendances changent.
// useState gère l'état local du composant.
// ============================================================================
import { useMemo, useState } from 'react';

// ============================================================================
// Import des composants Chart.js pour les graphiques.
// Chart.js est une bibliothèque de graphiques JavaScript.
// Ces imports configurent les fonctionnalités nécessaires.
// ============================================================================
import {
  // CategoryScale pour les axes catégoriels (labels textuels).
  CategoryScale,
  // Chart as ChartJS renomme l'import pour éviter les conflits.
  Chart as ChartJS,
  // Legend pour la légende du graphique.
  Legend,
  // LineElement pour les lignes du graphique.
  LineElement,
  // LinearScale pour les axes numériques linéaires.
  LinearScale,
  // PointElement pour les points de données.
  PointElement,
  // TimeScale pour les axes temporels.
  TimeScale,
  // Tooltip pour les infobulles au survol.
  Tooltip,
} from 'chart.js';

// ============================================================================
// Import de l'adaptateur date-fns pour Chart.js.
// Cet adaptateur permet d'utiliser des dates sur l'axe X.
// date-fns est une bibliothèque de manipulation de dates.
// ============================================================================
import 'chartjs-adapter-date-fns';

// ============================================================================
// Import du composant Line de react-chartjs-2.
// react-chartjs-2 est un wrapper React pour Chart.js.
// Line crée un graphique linéaire.
// ============================================================================
import { Line } from 'react-chartjs-2';

// ============================================================================
// Import du type CryptoAsset pour typer les props.
// CryptoAsset contient id, name, symbol, icon, currentPrice, history.
// ============================================================================
import type { CryptoAsset } from '../../state/types';

// ============================================================================
// Import des types Chart.js pour le typage TypeScript.
// ChartOptions type les options de configuration du graphique.
// TooltipItem type les données passées aux callbacks de tooltip.
// ============================================================================
import type { ChartOptions, TooltipItem } from 'chart.js';

// ============================================================================
// Enregistrement des composants Chart.js nécessaires.
// ChartJS.register() active les fonctionnalités importées.
// Cette étape est obligatoire avant d'utiliser les graphiques.
// ============================================================================
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);

// ============================================================================
// Type définissant les props du composant MarketOverviewPanel.
// cryptoAssets est un objet mappant les IDs aux objets CryptoAsset.
// ============================================================================
type MarketOverviewPanelProps = {
  cryptoAssets: Record<string, CryptoAsset>;
};

// ============================================================================
// Composant principal de vue d'ensemble du marché.
// 'export default function' exporte ce composant comme export par défaut.
// Ce composant affiche les prix des cryptos et un graphique d'évolution.
// ============================================================================
export default function MarketOverviewPanel({ cryptoAssets }: MarketOverviewPanelProps) {
  // ============================================================================
  // Conversion de l'objet cryptoAssets en tableau pour itération.
  // useMemo mémorise le résultat pour éviter les recalculs inutiles.
  // Object.values() retourne un tableau des valeurs de l'objet.
  // ============================================================================
  const assetList = useMemo(() => Object.values(cryptoAssets), [cryptoAssets]);
  
  // ============================================================================
  // État pour stocker l'ID de la crypto sélectionnée.
  // La première crypto du tableau est sélectionnée par défaut.
  // ?? '' fournit une chaîne vide si assetList[0] est undefined.
  // ============================================================================
  const [selectedAssetId, setSelectedAssetId] = useState(assetList[0]?.id ?? '');

  // Récupération de l'actif sélectionné depuis l'objet cryptoAssets.
  const selectedAsset = selectedAssetId ? cryptoAssets[selectedAssetId] : assetList[0];

  // ============================================================================
  // Préparation des données du graphique pour l'actif sélectionné.
  // useMemo recalcule uniquement quand selectedAsset change.
  // ============================================================================
  const chartData = useMemo(() => {
    // Retourne null si aucun actif n'est sélectionné.
    if (!selectedAsset) {
      return null;
    }

    return {
      // labels contient les dates de l'historique.
      labels: selectedAsset.history.map((point) => point.date),
      // datasets contient les séries de données.
      datasets: [
        {
          // label affiché dans la légende.
          label: `${selectedAsset.symbol} price`,
          // data contient les valeurs de prix.
          data: selectedAsset.history.map((point) => point.value),
          // fill: false désactive le remplissage sous la courbe.
          fill: false,
          // borderColor est la couleur de la ligne.
          borderColor: '#35a7ff',
          // backgroundColor est la couleur des points.
          backgroundColor: '#01ff19',
          // tension contrôle la courbure de la ligne (0=angles, 1=courbes).
          tension: 0.3,
        },
      ],
    };
  }, [selectedAsset]);

  // ============================================================================
  // Configuration des options du graphique.
  // useMemo<ChartOptions<'line'>> type explicitement les options.
  // ============================================================================
  const chartOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      // responsive: true adapte la taille au conteneur.
      responsive: true,
      // maintainAspectRatio: false permet une hauteur flexible.
      maintainAspectRatio: false,
      // Configuration des axes.
      scales: {
        x: {
          // type: 'time' interprète les labels comme des dates.
          type: 'time' as const,
          // unit: 'day' affiche les jours sur l'axe.
          time: { unit: 'day' as const },
          // grid: { display: false } masque les lignes de grille.
          grid: { display: false },
          // ticks configure l'affichage des graduations.
          ticks: { color: '#d1e3ff', maxRotation: 0 },
        },
        y: {
          ticks: { color: '#d1e3ff' },
          // Couleur semi-transparente pour la grille.
          grid: { color: 'rgba(53, 167, 255, 0.1)' },
        },
      },
      // Configuration des plugins.
      plugins: {
        // legend: { display: false } masque la légende.
        legend: { display: false },
        // Configuration du tooltip (infobulle).
        tooltip: {
          callbacks: {
            // Fonction de formatage du contenu du tooltip.
            label: (context: TooltipItem<'line'>) => {
              // Conversion sécurisée de la valeur en nombre.
              const rawValue = typeof context.raw === 'number' ? context.raw : Number(context.raw ?? 0);
              // Formatage avec le symbole euro.
              return `€${rawValue.toLocaleString()}`;
            },
          },
        } as const,
      },
    }),
    [],
  );

  // ============================================================================
  // Fonction pour calculer et afficher la variation de prix.
  // Retourne un objet avec le label formaté et un booléen positif/négatif.
  // ============================================================================
  const renderChange = (asset: CryptoAsset) => {
    // slice(-2) récupère les deux derniers éléments de l'historique.
    const [previous, current] = asset.history.slice(-2);
    // Retourne 0% si pas assez de données.
    if (!previous || !current) {
      return { label: '0%', positive: true };
    }
    // Calcul de la différence de prix.
    const diff = current.value - previous.value;
    // Calcul du pourcentage de variation.
    const percentage = (diff / previous.value) * 100;
    return {
      // Formatage avec signe + pour les valeurs positives.
      label: `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`,
      // positive: true si la variation est >= 0.
      positive: percentage >= 0,
    };
  };

  // ============================================================================
  // Rendu du panneau de vue d'ensemble du marché.
  // ============================================================================
  return (
    <div className="panel panel--market">
      {/* Section de la grille des cryptomonnaies */}
      <section className="panel__section">
        <header className="panel__header">
          <div>
            <h2>Supported cryptocurrencies</h2>
            <p>Monitor real-time pricing across the BitChest supported portfolio.</p>
          </div>
        </header>

        {/* Grille des cartes de cryptomonnaies */}
        <div className="market-grid">
          {assetList.map((asset, index) => {
            // Calcul de la variation pour cette crypto.
            const change = renderChange(asset);
            // Vérifie si cette crypto est sélectionnée.
            const isActive = selectedAsset && asset.id === selectedAsset.id;
            // Récupère le dernier prix de l'historique.
            const currentPrice = asset.history.at(-1)?.value ?? 0;
            return (
              <button
                key={asset.id}
                type="button"
                // Classe conditionnelle pour l'état actif.
                className={`market-card ${isActive ? 'market-card--active' : ''}`}
                // Sélectionne cette crypto au clic.
                onClick={() => setSelectedAssetId(asset.id)}
                // Animation échelonnée pour effet de cascade.
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="market-card__header">
                  <img src={asset.icon} alt={`${asset.name} icon`} className="market-card__icon" />
                  <div>
                    <p className="market-card__title">
                      {asset.name} <span>{asset.symbol}</span>
                    </p>
                    <p className="market-card__price">
                      €{currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                {/* Variation avec classe conditionnelle positive/négative */}
                <p className={`market-card__change ${change.positive ? 'positive' : 'negative'}`}>{change.label}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section du graphique (affiché si un actif est sélectionné) */}
      {selectedAsset && chartData ? (
        <section className="panel__section">
          <header className="panel__header">
            <div>
              <h3>
                {selectedAsset.name} ({selectedAsset.symbol}) price evolution
              </h3>
              <p>Last 30 days, expressed in euros.</p>
            </div>
          </header>
          <div className="chart-container">
            {/* Composant Line de react-chartjs-2 */}
            <Line data={chartData} options={chartOptions} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

