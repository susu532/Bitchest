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
export default function BuySell() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-bitchest-blue mb-6">
        Buy/Sell Cryptocurrencies
      </h1>
      <div className="flex gap-8 flex-wrap">
        <div className="flex-1 min-w-[290px] rounded-lg border border-bitchest-light-blue bg-bitchest-white p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3">Buy</h2>
          <form>
            <label className="block mb-2">Crypto</label>
            <select className="w-full mb-3 border rounded p-2 text-bitchest-blue">
              {cryptos.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <label className="block mb-2">Quantity</label>
            <input
              type="number"
              className="w-full mb-3 border rounded p-2"
              placeholder="Amount to buy"
            />
            <button className="btn-primary w-full">Buy Now</button>
          </form>
        </div>
        <div className="flex-1 min-w-[290px] rounded-lg border border-bitchest-light-blue bg-bitchest-white p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3">Sell</h2>
          <form>
            <label className="block mb-2">Crypto</label>
            <select className="w-full mb-3 border rounded p-2 text-bitchest-blue">
              {/* List cryptos held by user (BTC demo only) */}
              <option>Bitcoin</option>
            </select>
            <label className="block mb-2">Quantity</label>
            <input
              type="number"
              className="w-full mb-3 border rounded p-2"
              placeholder="Amount to sell"
            />
            <button className="btn-primary w-full">Sell Now</button>
          </form>
        </div>
      </div>
    </div>
  );
}
