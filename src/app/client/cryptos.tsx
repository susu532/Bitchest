'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
// Generate random walk price data for Bitcoin
function generateData() {
  let prices = [];
  let last = 25000;
  for (let i = 29; i >= 0; --i) {
    last = Math.max(8000, last + Math.floor(Math.random() * 1200 - 600));
    prices.push({
      day: `${30 - i}d ago`,
      price: last,
    });
  }
  return prices;
}
const btcHistory = generateData();

export default function ClientCryptos() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-bitchest-blue mb-6">
        Cryptocurrency Prices & Trends
      </h1>
      <table className="min-w-full text-left border border-bitchest-light-blue rounded-lg bg-bitchest-white mb-8">
        <thead>
          <tr>
            <th className="p-3 text-bitchest-blue">Name</th>
            <th className="p-3 text-bitchest-blue">Current Price (€)</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((c, idx) => (
            <tr key={c}>
              <td className="p-3">{c}</td>
              <td className="p-3">
                {idx === 0
                  ? `€${btcHistory[btcHistory.length - 1].price.toLocaleString()}`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="rounded-lg border border-bitchest-light-blue bg-bitchest-white p-6 mt-4">
        <div className="text-bitchest-blue font-semibold mb-3">
          Bitcoin (BTC) 30 Day Price Chart
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={btcHistory}
              margin={{ top: 8, right: 24, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#E8E8E8" />
              <XAxis
                dataKey="day"
                minTickGap={6}
                stroke="#38618C"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={['auto', 'auto']}
                stroke="#38618C"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `€${v / 1000}k`}
              />
              <Tooltip
                formatter={(v) => `€${v.toLocaleString()}`}
                labelStyle={{ color: '#38618C' }}
                contentStyle={{
                  background: '#fff',
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#01FF19"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 text-xs text-bitchest-blue">
          Actual crypto data and multiple charts will be shown here in the full
          version.
        </div>
      </div>
    </div>
  );
}
