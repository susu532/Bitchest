import { useMemo, useState } from 'react';

import type { FormEvent } from 'react';

import type { ClientAccount, CryptoAsset } from '../../state/types';
import { useAppServices } from '../../state/AppStateProvider';
import { api } from '../../utils/api';
import { enrichHoldingsWithPrices, summarizeHoldings } from '../../utils/wallet';
import { useNotifications } from '../common/Notifications';

type ClientWalletPanelProps = {
  account: ClientAccount;
  cryptoAssets: Record<string, CryptoAsset>;
};

export default function ClientWalletPanel({ account, cryptoAssets }: ClientWalletPanelProps) {
  const { fetchClientAccount } = useAppServices();
  const { addNotification } = useNotifications();

  const assetKeys = Object.keys(cryptoAssets);
  const defaultCryptoId = assetKeys[0] ?? '';

  const holdings = useMemo(() => summarizeHoldings(account.transactions), [account.transactions]);
  const enrichedHoldings = useMemo(
    () => enrichHoldingsWithPrices(holdings, cryptoAssets),
    [cryptoAssets, holdings],
  );

  const [buyForm, setBuyForm] = useState({ cryptoId: defaultCryptoId, quantity: 0 });
  const [sellForm, setSellForm] = useState({ cryptoId: defaultCryptoId, quantity: 0 });
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);
  const [tradeError, setTradeError] = useState<string | null>(null);

  const cryptoOptions = Object.values(cryptoAssets);

  const handleBuy = async (event: FormEvent) => {
    event.preventDefault();
    setTradeError(null);
    setTradeMessage(null);

    if (!buyForm.cryptoId) {
      setTradeError('Please select a cryptocurrency.');
      return;
    }

    const asset = cryptoAssets[buyForm.cryptoId];
    if (!asset) {
      setTradeError('Selected cryptocurrency is not available.');
      return;
    }

    if (buyForm.quantity <= 0) {
      setTradeError('Quantity must be greater than 0.');
      return;
    }

    const currentPrice = asset.history.at(-1)?.value ?? 0;
    const totalCost = Number((currentPrice * buyForm.quantity).toFixed(2));

    if (totalCost > account.balanceEUR) {
      const errorMsg = 'Insufficient euro balance to complete this purchase.';
      setTradeError(errorMsg);

      addNotification('Insufficient Balance', 'error', `You need €${totalCost.toLocaleString()} but only have €${account.balanceEUR.toLocaleString()}.`, 6000);
      return;
    }

    try {
      const response: any = await api.buyCryptocurrency(buyForm.cryptoId, buyForm.quantity, currentPrice);
      if (response.success) {
        const successMsg = `Purchase completed. You bought ${buyForm.quantity} ${asset.symbol} for €${totalCost.toLocaleString()}.`;
        setTradeMessage(successMsg);

        addNotification(
          'Purchase Successful',
          'success',
          `You successfully bought ${buyForm.quantity} ${asset.symbol} for €${totalCost.toLocaleString()}.`,
          5000
        );
        setBuyForm((previous) => ({ ...previous, quantity: 0 }));

        await fetchClientAccount();
      } else {
        setTradeError(response.message || 'Purchase failed');
        addNotification('Purchase Failed', 'error', response.message || 'Purchase failed', 6000);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Purchase failed';
      setTradeError(errorMsg);

      addNotification('Purchase Failed', 'error', errorMsg, 8000);
    }
  };

  const handleSell = async (event: FormEvent) => {
    event.preventDefault();
    setTradeError(null);
    setTradeMessage(null);

    if (!sellForm.cryptoId) {
      setTradeError('Please select a cryptocurrency.');
      return;
    }

    const asset = cryptoAssets[sellForm.cryptoId];
    if (!asset) {
      setTradeError('Selected cryptocurrency is not available.');
      return;
    }

    if (sellForm.quantity <= 0) {
      setTradeError('Quantity must be greater than 0.');
      return;
    }

    const available = holdings[sellForm.cryptoId]?.quantity ?? 0;
    if (available < sellForm.quantity) {
      const errorMsg = 'You do not have enough units to sell this amount.';
      setTradeError(errorMsg);

      addNotification(
        'Insufficient Holdings',
        'error',
        `You only have ${available.toFixed(6)} ${asset.symbol} but tried to sell ${sellForm.quantity}.`,
        6000
      );
      return;
    }

    const currentPrice = asset.history.at(-1)?.value ?? 0;
    const proceeds = Number((currentPrice * sellForm.quantity).toFixed(2));

    try {
      const response: any = await api.sellCryptocurrency(sellForm.cryptoId, sellForm.quantity, currentPrice);
      if (response.success) {
        const successMsg = `Sale completed. You sold ${sellForm.quantity} ${asset.symbol} for €${proceeds.toLocaleString()}.`;
        setTradeMessage(successMsg);

        addNotification(
          'Sale Successful',
          'success',
          `You successfully sold ${sellForm.quantity} ${asset.symbol} for €${proceeds.toLocaleString()}.`,
          5000
        );
        setSellForm((previous) => ({ ...previous, quantity: 0 }));

        await fetchClientAccount();
      } else {
        setTradeError(response.message || 'Sale failed');
        addNotification('Sale Failed', 'error', response.message || 'Sale failed', 6000);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Sale failed';
      setTradeError(errorMsg);

      addNotification('Sale Failed', 'error', errorMsg, 8000);
    }
  };

  return (
    <div className="panel">
      <section className="panel__section" style={{ animationDelay: '0.1s' }}>
        <header className="panel__header">
          <div>
            <h2>Your wallet</h2>
            <p>Current holdings valued in euros along with profit and loss per cryptocurrency.</p>
          </div>
        </header>
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Asset</th>
              <th>Quantity</th>
              <th>Average price</th>
              <th>Current price</th>
              <th>Current value</th>
              <th>Profit / loss</th>
            </tr>
          </thead>
          <tbody>
            {enrichedHoldings.length === 0 ? (
              <tr>
                <td colSpan={6} className="table__empty">
                  You have not purchased any cryptocurrencies yet.
                </td>
              </tr>
            ) : (
              enrichedHoldings.map((holding) => {
                const asset = cryptoAssets[holding.cryptoId];
                return (
                  <tr key={holding.cryptoId}>
                    <td>
                      <div className="table__asset">
                        <img src={asset.icon} alt={`${asset.name} icon`} />
                        <div>
                          <span className="table__primary-text">{asset.name}</span>
                          <span className="table__secondary-text">{asset.symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td>{holding.quantity.toFixed(8)}</td>
                    <td>€{holding.averagePrice.toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                    <td>€{holding.currentPrice.toLocaleString()}</td>
                    <td>€{holding.currentValue.toLocaleString()}</td>
                    <td className={holding.profitLoss >= 0 ? 'positive' : 'negative'}>
                      €{holding.profitLoss.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      <section className="panel__section panel__section--split" style={{ animationDelay: '0.2s' }}>
        <div className="trade-card" style={{ animationDelay: '0.3s' }}>
          <h3>Buy cryptocurrency</h3>
          <form className="form form--stacked" onSubmit={handleBuy}>
            <label className="form__label">
              Asset
              <select
                className="form__input"
                value={buyForm.cryptoId}
                onChange={(event) => setBuyForm((previous) => ({ ...previous, cryptoId: event.target.value }))}
              >
                {cryptoOptions.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.symbol}) · €{asset.history.at(-1)?.value.toLocaleString()}
                  </option>
                ))}
              </select>
            </label>
            <label className="form__label">
              Quantity
              <input
                className="form__input"
                type="number"
                step="0.000001"
                min="0"
                value={buyForm.quantity === 0 ? '' : String(buyForm.quantity)}
                onChange={(event) =>
                  setBuyForm((previous) => ({
                    ...previous,
                    quantity: Number(event.target.value),
                  }))
                }
                required
              />
            </label>
            <p className="form__hint">Your available euros: €{account.balanceEUR.toLocaleString()}</p>
            <button type="submit" className="button button--primary">
              Buy at market price
            </button>
          </form>
        </div>

        <div className="trade-card" style={{ animationDelay: '0.4s' }}>
          <h3>Sell cryptocurrency</h3>
          <form className="form form--stacked" onSubmit={handleSell}>
            <label className="form__label">
              Asset
              <select
                className="form__input"
                value={sellForm.cryptoId}
                onChange={(event) => setSellForm((previous) => ({ ...previous, cryptoId: event.target.value }))}
              >
                {cryptoOptions.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.symbol}) · owned{' '}
                    {(holdings[asset.id]?.quantity ?? 0).toFixed(6)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form__label">
              Quantity
              <input
                className="form__input"
                type="number"
                step="0.000001"
                min="0"
                value={sellForm.quantity === 0 ? '' : String(sellForm.quantity)}
                onChange={(event) =>
                  setSellForm((previous) => ({
                    ...previous,
                    quantity: Number(event.target.value),
                  }))
                }
                required
              />
            </label>
            <p className="form__hint">
              You own {(holdings[sellForm.cryptoId]?.quantity ?? 0).toFixed(6)} units of this crypto.
            </p>
            <button type="submit" className="button button--secondary">
              Sell at market price
            </button>
          </form>
        </div>
      </section>

      <section className="panel__section" style={{ animationDelay: '0.5s' }}>
        {tradeError ? <p className="form__error">{tradeError}</p> : null}
        {tradeMessage ? <p className="form__success">{tradeMessage}</p> : null}
        <header className="panel__header">
          <div>
            <h3>Transaction history</h3>
            <p>All operations sorted by most recent first.</p>
          </div>
        </header>
        <table className="table table--compact">
          <thead>
            <tr>
              <th></th>
              <th>Date</th>
              <th>Type</th>
              <th>Asset</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {account.transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="table__empty">
                  No transactions yet. Your operations will appear here.
                </td>
              </tr>
            ) : (
              [...account.transactions]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((transaction) => {
                  const asset = cryptoAssets[transaction.cryptoId];
                  const total = transaction.pricePerUnit * transaction.quantity;
                  return (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                      <td className={transaction.type === 'buy' ? 'positive' : 'negative'}>
                        {transaction.type === 'buy' ? 'Buy' : 'Sell'}
                      </td>
                      <td>{asset.symbol}</td>
                      <td>{transaction.quantity.toFixed(8)}</td>
                      <td>€{transaction.pricePerUnit.toLocaleString()}</td>
                      <td>€{total.toLocaleString()}</td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

