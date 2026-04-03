<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteSettingController extends Controller
{
    private function defaults(): array
    {
        return [
            'municipality_name' => 'Commune du Maroc',
            'email' => 'contact@commune.ma',
            'phone' => '+212 5 00 00 00 00',
            'logo_path' => null,
        ];
    }

    private function getSettings(): SiteSetting
    {
        return SiteSetting::query()->firstOrCreate([], $this->defaults());
    }

    public function show()
    {
        return response()->json($this->getSettings());
    }

    public function update(Request $request)
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json([
                'message' => 'Acces refuse.',
            ], 403);
        }

        $validated = $request->validate([
            'municipality_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:30',
            'logo' => 'nullable|image|max:2048',
        ]);

        $settings = $this->getSettings();

        if ($request->hasFile('logo')) {
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }

            $validated['logo_path'] = $request->file('logo')->store('site-settings', 'public');
        }

        unset($validated['logo']);

        $settings->update($validated);

        return response()->json($settings->fresh());
    }
}
