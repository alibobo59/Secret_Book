<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.bookId' => ['required', 'exists:books,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'shippingAddress.name' => ['required', 'string', 'max:255'],
            'shippingAddress.address' => ['required', 'string', 'max:255'],
            'shippingAddress.city' => ['required', 'string', 'max:255'],
            'contactInfo.email' => ['nullable', 'email', 'max:255', 'regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/'],
            'contactInfo.phone' => ['required', 'string', 'regex:/^0\d{9}$/'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'contactInfo.email.regex' => 'Please enter a valid email address.',
            'contactInfo.phone.regex' => 'Please enter a valid phone number starting with 0 followed by 9 digits.',
        ];
    }
}
