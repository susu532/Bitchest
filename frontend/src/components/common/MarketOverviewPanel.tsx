// Hedha el component eli yaffichi vue d'ensemble mta3 el marché crypto - les prix w el graphique mta3 l'évolution
import { useMemo, useState } from 'react';

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
} from 'chart.js';

import 'chartjs-adapter-date-fns';

import { Line } from 'react-chartjs-2';

import type { CryptoAsset } from '../../state/types';
import { generateFullHistoryWithCurrent } from '../../utils/priceHistory';

import type { ChartOptions, TooltipItem } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);

type MarketOverviewPanelProps = {
  cryptoAssets: Record<string, CryptoAsset>;
};

export default function MarketOverviewPanel({ cryptoAssets }: MarketOverviewPanelProps) {
  const assetList = useMemo(() => Object.values(cryptoAssets), [cryptoAssets]);
  
  const [selectedAssetId, setSelectedAssetId] = useState<string>(() => {
    return cryptoAssets['bitcoin']?.id ?? assetList[0]?.id ?? 'bitcoin';
  });

  const selectedAssetBase = (selectedAssetId && cryptoAssets[selectedAssetId])
    ? cryptoAssets[selectedAssetId]
    : (cryptoAssets['bitcoin'] ?? assetList[0]);

  const selectedAsset = useMemo(() => {
    if (!selectedAssetBase) return null;
    return {
      ...selectedAssetBase,
      history: generateFullHistoryWithCurrent(
        selectedAssetBase.id,
        selectedAssetBase.currentPrice,
        selectedAssetBase.history
      ),
    };
  }, [selectedAssetBase]);

  // Hne n7adhrou el data mta3 el graphique - labels bel dates w datasets bel prix
  const chartData = useMemo(() => {
    if (!selectedAsset || selectedAsset.history.length === 0) {
      return null;
    }

    return {
      labels: selectedAsset.history.map((point) => point.date),
      datasets: [
        {
          label: `${selectedAsset.symbol} price`,
          data: selectedAsset.history.map((point) => point.value),
          fill: true,
          borderColor: '#35a7ff',
          backgroundColor: 'rgba(53, 167, 255, 0.08)',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: '#35a7ff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.25,
        },
      ],
    };
  }, [selectedAsset]);

  // Options mta3 el chart - axes temporels, tooltips bel euro, w responsive design
  const chartOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          type: 'time' as const,
          time: { 
            unit: 'day' as const,
            displayFormats: {
              day: 'MMM d',
            },
          },
          grid: { display: false },
          ticks: { 
            color: '#8fa2b7', 
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 7,
          },
        },
        y: {
          ticks: { 
            color: '#8fa2b7',
            callback: (value) => `€${Number(value).toLocaleString()}`,
          },
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#e2e8f0',
          bodyColor: '#35a7ff',
          borderColor: 'rgba(53, 167, 255, 0.3)',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => {
              if (!tooltipItems.length) return '';
              const xVal = tooltipItems[0].parsed.x;
              if (xVal === null || xVal === undefined) return '';
              const date = new Date(xVal);
              return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
            },
            label: (context: TooltipItem<'line'>) => {
              const rawValue = typeof context.raw === 'number' ? context.raw : Number(context.raw ?? 0);
              return `Price: €${rawValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            },
          },
        } as const,
      },
    }),
    [],
  );

  // Na7sbou el variation mta3 el prix - pourcentage mta3 el changement bin ekher zouz jours
  const renderChange = (asset: CryptoAsset) => {
    const history = asset.history && asset.history.length >= 2
      ? asset.history
      : generateFullHistoryWithCurrent(asset.id, asset.currentPrice, asset.history);
    const [previous, current] = history.slice(-2);
    if (!previous || !current || previous.value === 0) {
      return { label: '0.00%', positive: true };
    }
    const diff = current.value - previous.value;
    const percentage = (diff / previous.value) * 100;
    return {
      label: `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`,
      positive: percentage >= 0,
    };
  };

  // Rendu mta3 el grille des cryptos w el graphique - kol carte fiha el prix w el variation
  return (
    <div className="panel panel--market">
      <section className="panel__section">
        <header className="panel__header">
          <div>
            <h2>Supported cryptocurrencies</h2>
            <p>Monitor real-time pricing across the BitChest supported portfolio.</p>
          </div>
        </header>

        <div className="market-grid">
          {assetList.map((asset, index) => {
            const change = renderChange(asset);
            const isActive = selectedAsset && asset.id === selectedAsset.id;
            const currentPrice = asset.currentPrice || asset.history.at(-1)?.value || 0;
            return (
              <button
                key={asset.id}
                type="button"
                className={`market-card ${isActive ? 'market-card--active' : ''}`}
                onClick={() => setSelectedAssetId(asset.id)}
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
                <p className={`market-card__change ${change.positive ? 'positive' : 'negative'}`}>{change.label}</p>
              </button>
            );
          })}
        </div>
      </section>

      {selectedAsset && chartData ? (
        <section className="panel__section">
          <header className="panel__header">
            <div>
              <h3>
                {selectedAsset.name} ({selectedAsset.symbol}) price evolution
              </h3>
              <p>
                {(() => {
                  if (!selectedAsset.history || selectedAsset.history.length === 0) return 'No data';
                  const firstDate = new Date(selectedAsset.history[0].date);
                  const lastDate = new Date(selectedAsset.history[selectedAsset.history.length - 1].date);
                  const first = firstDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  const last = lastDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  return `${first} - ${last} (${selectedAsset.history.length} days), expressed in euros.`;
                })()}
              </p>
            </div>
          </header>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
