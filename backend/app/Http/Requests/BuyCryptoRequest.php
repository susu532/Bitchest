<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;


class BuyCryptoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'client';
    }

    public function rules(): array
    {
        return [
            'cryptoId' => 'required|string|exists:cryptocurrencies,id',
            'quantity' => 'required|numeric|min:0.00000001',
            'pricePerUnit' => 'required|numeric|min:0.01',
        ];
    }

    public function messages(): array
    {
        return [
            'cryptoId.required' => 'Cryptocurrency is required.',
            'cryptoId.exists' => 'Selected cryptocurrency does not exist.',
            'quantity.required' => 'Quantity is required.',
            'quantity.min' => 'Quantity must be at least 0.00000001.',
            'pricePerUnit.required' => 'Price per unit is required.',
            'pricePerUnit.min' => 'Price must be at least €0.01.',
        ];
    }
}
