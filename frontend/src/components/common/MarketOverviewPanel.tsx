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
import type { ChartOptions, TooltipItem } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);

type MarketOverviewPanelProps = {
  cryptoAssets: Record<string, CryptoAsset>;
};

export default function MarketOverviewPanel({ cryptoAssets }: MarketOverviewPanelProps) {
  const assetList = useMemo(() => Object.values(cryptoAssets), [cryptoAssets]);
  const [selectedAssetId, setSelectedAssetId] = useState(assetList[0]?.id ?? '');

  const selectedAsset = selectedAssetId ? cryptoAssets[selectedAssetId] : assetList[0];

  const chartData = useMemo(() => {
    if (!selectedAsset) {
      return null;
    }

    return {
      labels: selectedAsset.history.map((point) => point.date),
      datasets: [
        {
          label: `${selectedAsset.symbol} price`,
          data: selectedAsset.history.map((point) => point.value),
          fill: false,
          borderColor: '#35a7ff',
          backgroundColor: '#01ff19',
          tension: 0.3,
        },
      ],
    };
  }, [selectedAsset]);

  const chartOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time' as const,
          time: { unit: 'day' as const },
          grid: { display: false },
          ticks: { color: '#d1e3ff', maxRotation: 0 },
        },
        y: {
          ticks: { color: '#d1e3ff' },
          grid: { color: 'rgba(53, 167, 255, 0.1)' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'line'>) => {
              const rawValue = typeof context.raw === 'number' ? context.raw : Number(context.raw ?? 0);
              return `€${rawValue.toLocaleString()}`;
            },
          },
        } as const,
      },
    }),
    [],
  );

  const renderChange = (asset: CryptoAsset) => {
    const [previous, current] = asset.history.slice(-2);
    if (!previous || !current) {
      return { label: '0%', positive: true };
    }
    const diff = current.value - previous.value;
    const percentage = (diff / previous.value) * 100;
    return {
      label: `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`,
      positive: percentage >= 0,
    };
  };

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
            const currentPrice = asset.history.at(-1)?.value ?? 0;
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
              <p>Last 30 days, expressed in euros.</p>
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

