<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Wallet;
use App\Models\Cryptocurrency;
use App\Models\Transaction;
use Carbon\Carbon;

class WalletController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $wallets = Wallet::where('user_id', $user->id)->with('crypto')->get();

        $result = $wallets->map(function($w){
            $transactions = $w->transactions()->orderBy('date','asc')->get();
            $totalCost = $transactions->where('type','buy')->sum(function($t){ return $t->quantity * $t->price; });
            $totalQty = $transactions->where('type','buy')->sum('quantity') - $transactions->where('type','sell')->sum('quantity');
            $avgPrice = $totalQty > 0 ? ($totalCost / $totalQty) : 0;

            $currentPrice = $w->crypto->prices()->orderBy('date','desc')->first()?->price ?? 0;
            $currentValue = $currentPrice * $w->amount;
            $profit = $currentValue - $totalCost;

            return [
                'crypto' => $w->crypto->symbol,
                'name' => $w->crypto->name,
                'amount' => (float)$w->amount,
                'average_buy_price' => (float)$avgPrice,
                'total_cost' => (float)$totalCost,
                'current_price' => (float)$currentPrice,
                'current_value' => (float)$currentValue,
                'profit' => (float)$profit,
                'transactions' => $transactions
            ];
        });

        return response()->json(['balance' => (float)$user->balance, 'wallet' => $result]);
    }

    public function buy(Request $request)
    {
        $data = $request->validate([
            'cryptocurrency_id' => 'required|integer|exists:cryptocurrencies,id',
            'quantity' => 'required|numeric|min:0.00000001'
        ]);

        $user = Auth::user();
        $crypto = Cryptocurrency::findOrFail($data['cryptocurrency_id']);
        $price = $crypto->prices()->orderBy('date','desc')->first()?->price;
        if (!$price) return response()->json(['message' => 'No price available for that crypto'], 422);

        $cost = (float)$price * (float)$data['quantity'];

        if ($user->balance < $cost) {
            return response()->json(['message' => 'Insufficient balance'], 422);
        }

        $user->balance -= $cost;
        $user->save();

        $wallet = Wallet::firstOrCreate(['user_id' => $user->id, 'cryptocurrency_id' => $crypto->id]);
        $wallet->amount += (float)$data['quantity'];
        $wallet->save();

        Transaction::create(['wallet_id' => $wallet->id, 'type' => 'buy', 'quantity' => $data['quantity'], 'price' => $price, 'date' => Carbon::now()]);

        return response()->json(['message' => 'Purchase successful', 'balance' => $user->balance]);
    }

    public function sell(Request $request)
    {
        $data = $request->validate([
            'cryptocurrency_id' => 'required|integer|exists:cryptocurrencies,id',
            'quantity' => 'required|numeric|min:0.00000001'
        ]);

        $user = Auth::user();
        $crypto = Cryptocurrency::findOrFail($data['cryptocurrency_id']);
        $wallet = Wallet::where('user_id', $user->id)->where('cryptocurrency_id', $crypto->id)->first();
        if (!$wallet || $wallet->amount < $data['quantity']) {
            return response()->json(['message' => 'Not enough crypto to sell'], 422);
        }

        $price = $crypto->prices()->orderBy('date','desc')->first()?->price;
        if (!$price) return response()->json(['message' => 'No price available for that crypto'], 422);

        $total = (float)$price * (float)$data['quantity'];

        $wallet->amount -= (float)$data['quantity'];
        $wallet->save();

        Transaction::create(['wallet_id' => $wallet->id, 'type' => 'sell', 'quantity' => $data['quantity'], 'price' => $price, 'date' => Carbon::now()]);

        $user->balance += $total;
        $user->save();

        return response()->json(['message' => 'Sold successfully', 'balance' => $user->balance]);
    }
}
