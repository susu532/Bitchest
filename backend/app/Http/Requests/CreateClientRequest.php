<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest pour la création d'un client
 * Centralise les règles de validation et les messages d'erreur
 */
class CreateClientRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé à faire cette requête
     */
    public function authorize(): bool
    {
        // Seuls les admins peuvent créer des clients
        return auth()->check() && auth()->user()->role === 'admin';
    }

    /**
     * Règles de validation
     */
    public function rules(): array
    {
        return [
            'firstName' => 'required|string|min:2|max:50',
            'lastName' => 'required|string|min:2|max:50',
            'email' => 'required|email:rfc,dns|unique:users|max:255|regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/',
        ];
    }

    /**
     * Messages d'erreur personnalisés
     */
    public function messages(): array
    {
        return [
            'email.email' => 'The email address must be a valid email.',
            'email.unique' => 'This email address is already in use.',
            'email.regex' => 'The email address format is invalid.',
            'firstName.min' => 'First name must be at least 2 characters.',
            'firstName.max' => 'First name cannot exceed 50 characters.',
            'firstName.required' => 'First name is required.',
            'lastName.min' => 'Last name must be at least 2 characters.',
            'lastName.max' => 'Last name cannot exceed 50 characters.',
            'lastName.required' => 'Last name is required.',
        ];
    }
}
