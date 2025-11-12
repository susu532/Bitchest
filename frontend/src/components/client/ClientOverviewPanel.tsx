import type { ClientAccount, CryptoAsset, User } from '../../state/types';
import { calculatePortfolioValue, enrichHoldingsWithPrices, summarizeHoldings } from '../../utils/wallet';

type ClientOverviewPanelProps = {
  account: ClientAccount;
  cryptoAssets: Record<string, CryptoAsset>;
  user: User;
};

export default function ClientOverviewPanel({ account, cryptoAssets, user }: ClientOverviewPanelProps) {
  const holdings = summarizeHoldings(account.transactions);
  const enriched = enrichHoldingsWithPrices(holdings, cryptoAssets);
  const portfolio = calculatePortfolioValue(enriched, account.balanceEUR);

  const topHoldings = [...enriched]
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 3);

  return (
    <div className="panel">
      <section className="panel__section">
        <header className="panel__header">
          <div>
            <h2>Welcome back, {user.firstName}</h2>
            <p>Track your overall performance and keep an eye on your top positions.</p>
          </div>
        </header>

        <div className="stats-grid">
          <article className="stat-card" style={{ animationDelay: '0.1s' }}>
            <h3>Total balance</h3>
            <p className="stat-card__value">€{portfolio.totalBalance.toLocaleString()}</p>
            <span className="stat-card__caption">Includes cash and crypto positions</span>
          </article>
          <article className="stat-card" style={{ animationDelay: '0.2s' }}>
            <h3>Available euros</h3>
            <p className="stat-card__value">€{account.balanceEUR.toLocaleString()}</p>
            <span className="stat-card__caption">Ready to deploy instantly</span>
          </article>
          <article className="stat-card" style={{ animationDelay: '0.3s' }}>
            <h3>Crypto holdings</h3>
            <p className="stat-card__value">€{portfolio.marketValue.toLocaleString()}</p>
            <span className="stat-card__caption">Current market value</span>
          </article>
          <article className="stat-card" style={{ animationDelay: '0.4s' }}>
            <h3>Profit / loss</h3>
            <p className={`stat-card__value ${portfolio.profitLoss >= 0 ? 'positive' : 'negative'}`}>
              €{portfolio.profitLoss.toLocaleString()}
            </p>
            <span className="stat-card__caption">
              Based on average purchase price for each crypto position
            </span>
          </article>
        </div>
      </section>

      <section className="panel__section">
        <header className="panel__header">
          <div>
            <h3>Top positions</h3>
            <p>Your three largest cryptocurrency holdings by market value.</p>
          </div>
        </header>

        {topHoldings.length === 0 ? (
          <p>You currently do not hold any cryptocurrencies. Visit the wallet section to purchase your first assets.</p>
        ) : (
          <div className="positions-list">
            {topHoldings.map((holding, index) => {
              const asset = cryptoAssets[holding.cryptoId];
              return (
                <article key={holding.cryptoId} className="position-card" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
                  <div className="position-card__icon">
                    <img src={asset.icon} alt={`${asset.name} icon`} />
                  </div>
                  <div className="position-card__details">
                    <h4>
                      {asset.name} <span>{holding.quantity.toFixed(4)}</span>
                    </h4>
                    <p>
                      Avg. price €{holding.averagePrice.toLocaleString()} · Current €{holding.currentPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className={`position-card__pl ${holding.profitLoss >= 0 ? 'positive' : 'negative'}`}>
                    €{holding.profitLoss.toLocaleString()}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

