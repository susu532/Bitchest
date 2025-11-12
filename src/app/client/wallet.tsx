import React from 'react';

const cryptos = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    holdings: [
      { date: '2020-10-01', quantity: 1, price: 10000 },
      { date: '2021-03-14', quantity: 0.5, price: 18000 },
      { date: '2022-01-27', quantity: 0.5, price: 20000 },
    ],
    current: 30000,
  },
  // Add 9 more demo entries if needed
];

export default function Wallet() {
  // Calculate totals for first entry as demo
  const btc = cryptos[0];
  const totalBought = btc.holdings.reduce((a, c) => a + c.quantity, 0);
  const totalSpend = btc.holdings.reduce((a, c) => a + c.quantity * c.price, 0);
  const avg = totalSpend / totalBought;
  const currentValue = totalBought * btc.current;
  const profit = currentValue - totalSpend;
  return (
    <div className="p-8">
      <div className="mb-4 p-4 rounded-lg bg-bitchest-green/10 text-lg font-semibold text-bitchest-blue">
        Euro Balance: <span className="text-bitchest-green">€500.00</span>{' '}
        (always visible)
      </div>
      <h1 className="text-2xl font-bold text-bitchest-blue mb-6">My Wallet</h1>
      <div className="rounded-lg border border-bitchest-light-blue bg-bitchest-white p-6">
        <table className="min-w-full text-left mb-8">
          <thead>
            <tr>
              <th className="p-2 text-bitchest-blue">Crypto</th>
              <th className="p-2 text-bitchest-blue">Total</th>
              <th className="p-2 text-bitchest-blue">Avg Price</th>
              <th className="p-2 text-bitchest-blue">Current Price</th>
              <th className="p-2 text-bitchest-blue">Current P/L</th>
              <th className="p-2 text-bitchest-blue">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">Bitcoin (BTC)</td>
              <td className="p-2">{totalBought} BTC</td>
              <td className="p-2">€{avg.toLocaleString()}</td>
              <td className="p-2">€{btc.current.toLocaleString()}</td>
              <td
                className={`p-2 ${profit >= 0 ? 'text-bitchest-green' : 'text-bitchest-red'}`}
              >
                {profit >= 0 ? '+' : ''}€{profit.toLocaleString()}
              </td>
              <td className="p-2">
                <button className="btn-primary">Sell</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mb-3 text-bitchest-blue font-semibold">
          Purchase history for BTC:
        </div>
        <table className="min-w-full text-left mb-3">
          <thead>
            <tr>
              <th className="p-2 text-bitchest-blue">Date</th>
              <th className="p-2 text-bitchest-blue">Quantity</th>
              <th className="p-2 text-bitchest-blue">Price (€/unit)</th>
            </tr>
          </thead>
          <tbody>
            {btc.holdings.map((h, i) => (
              <tr key={i}>
                <td className="p-2">{h.date}</td>
                <td className="p-2">{h.quantity}</td>
                <td className="p-2">€{h.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Profit/loss and transaction history for more cryptos soon */}
      </div>
    </div>
  );
}
