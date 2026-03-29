<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RefuseReclamationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'employe';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'refusal_reason' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('refusal_reason')) {
            $this->merge([
                'refusal_reason' => trim((string) $this->input('refusal_reason')),
            ]);
        }
    }
}
