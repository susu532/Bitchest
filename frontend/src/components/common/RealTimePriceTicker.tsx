import { useEffect, useState, useMemo } from 'react';
import type { CryptoAsset } from '../../state/types';
import { echoService } from '../../utils/echo';
import '../styles/price-ticker.css';

interface PriceUpdate {
  cryptoId: string;
  price: number;
  previousPrice: number;
  priceChange: number;
  percentageChange: number;
  updatedAt: string;
}

interface RealTimePriceTickerProps {
  cryptoAssets: Record<string, CryptoAsset>;
  onPriceUpdate?: (update: PriceUpdate) => void;
}

export default function RealTimePriceTicker({ cryptoAssets, onPriceUpdate }: RealTimePriceTickerProps) {
  const [realTimePrices, setRealTimePrices] = useState<Record<string, PriceUpdate>>({});

  useEffect(() => {
    // Subscribe to all crypto price updates
    echoService.subscribeToprices((data: any) => {
      const update: PriceUpdate = {
        cryptoId: data.cryptoId,
        price: data.price,
        previousPrice: data.previousPrice,
        priceChange: data.priceChange,
        percentageChange: data.percentageChange,
        updatedAt: data.updatedAt,
      };

      setRealTimePrices((prev) => ({
        ...prev,
        [data.cryptoId]: update,
      }));

      if (onPriceUpdate) {
        onPriceUpdate(update);
      }
    });

    return () => {
      echoService.unsubscribe('crypto-prices');
    };
  }, [onPriceUpdate]);

  const displayPrices = useMemo(() => {
    return Object.entries(cryptoAssets).map(([cryptoId, asset]) => {
      const realTimeData = realTimePrices[cryptoId];
      const currentPrice = realTimeData?.price ?? asset.history.at(-1)?.value ?? 0;
      const percentageChange = realTimeData?.percentageChange ?? 0;

      return {
        cryptoId,
        symbol: asset.symbol,
        name: asset.name,
        price: currentPrice,
        percentageChange,
        isUpdated: !!realTimeData,
      };
    });
  }, [cryptoAssets, realTimePrices]);

  return (
    <div className="price-ticker">
      <div className="price-ticker__header">
        <h3>Live Market Prices</h3>
        <span className="price-ticker__status">
          {Object.keys(realTimePrices).length > 0 ? '🔴 Live' : '⚪ Waiting for updates'}
        </span>
      </div>

      <div className="price-ticker__grid">
        {displayPrices.map((item) => (
          <div key={item.cryptoId} className={`price-ticker__item ${item.isUpdated ? 'price-ticker__item--updated' : ''}`}>
            <div className="price-ticker__crypto">
              <span className="price-ticker__symbol">{item.symbol}</span>
              <span className="price-ticker__name">{item.name}</span>
            </div>

            <div className="price-ticker__price">
              <span className="price-ticker__value">€{item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span
                className={`price-ticker__change ${item.percentageChange >= 0 ? 'price-ticker__change--up' : 'price-ticker__change--down'}`}
              >
                {item.percentageChange >= 0 ? '📈' : '📉'}
                {Math.abs(item.percentageChange).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
