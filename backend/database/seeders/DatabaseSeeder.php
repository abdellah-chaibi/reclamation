<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        SiteSetting::query()->firstOrCreate([], [
            'municipality_name' => 'Commune Territoriale Kasba Tadla',
            'email' => 'contact@commune.ma',
            'phone' => '+212 5 23 00 00 00',
            'address_line_1' => 'Rue Mohamed V, Hay Al Idari',
            'address_line_2' => 'Kasbah Tadla, Beni Mellal',
            'maps_url' => 'https://maps.google.com/?q=Commune+Kasbah+Tadla',
            'logo_path' => null,
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
