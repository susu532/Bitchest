import React from 'react';

const cryptos = [
  'Bitcoin',
  'Ethereum',
  'Ripple',
  'Bitcoin Cash',
  'Cardano',
  'Litecoin',
  'NEM',
  'Stellar',
  'IOTA',
  'Dash',
];

export default function AdminCryptos() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-bitchest-blue mb-6">
        Cryptocurrency Prices
      </h1>
      <table className="min-w-full text-left border border-bitchest-light-blue rounded-lg bg-bitchest-white">
        <thead>
          <tr>
            <th className="p-3 text-bitchest-blue">Name</th>
            <th className="p-3 text-bitchest-blue">Current Price (€)</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((c) => (
            <tr key={c}>
              <td className="p-3">{c}</td>
              <td className="p-3">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
