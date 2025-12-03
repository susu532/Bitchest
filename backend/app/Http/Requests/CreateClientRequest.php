<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;


class CreateClientRequest extends FormRequest
{
    
    public function authorize(): bool
    {

        return auth()->check() && auth()->user()->role === 'admin';
    }

    
    public function rules(): array
    {
        return [
            'firstName' => 'required|string|min:2|max:50',
            'lastName' => 'required|string|min:2|max:50',
            'email' => 'required|email:rfc,dns|unique:users|max:255|regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/',
        ];
    }

    
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
