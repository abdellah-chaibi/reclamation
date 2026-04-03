<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SiteSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_read_site_settings(): void
    {
        SiteSetting::query()->create([
            'municipality_name' => 'Commune de Fes',
            'email' => 'fes@example.com',
            'phone' => '+212 5 35 00 00 00',
        ]);

        $response = $this->getJson('/api/site-settings');

        $response
            ->assertOk()
            ->assertJsonPath('municipality_name', 'Commune de Fes')
            ->assertJsonPath('email', 'fes@example.com')
            ->assertJsonPath('phone', '+212 5 35 00 00 00');
    }

    public function test_admin_can_update_site_settings_with_logo(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->post('/api/site-settings', [
            'municipality_name' => 'Commune de Rabat',
            'email' => 'contact@rabat.ma',
            'phone' => '+212 5 37 00 00 00',
            'logo' => UploadedFile::fake()->createWithContent('logo.png', 'fake-image-content'),
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('municipality_name', 'Commune de Rabat')
            ->assertJsonPath('email', 'contact@rabat.ma')
            ->assertJsonPath('phone', '+212 5 37 00 00 00');

        $this->assertDatabaseHas('site_settings', [
            'municipality_name' => 'Commune de Rabat',
            'email' => 'contact@rabat.ma',
            'phone' => '+212 5 37 00 00 00',
        ]);

        $this->assertNotNull(SiteSetting::query()->first()?->logo_path);
        Storage::disk('public')->assertExists(SiteSetting::query()->first()->logo_path);
    }
}
