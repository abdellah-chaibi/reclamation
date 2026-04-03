<?php

namespace Tests\Feature;

use App\Models\Departement;
use App\Models\Reclamation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TakeReclamationTest extends TestCase
{
    use RefreshDatabase;

    public function test_first_employee_can_take_reclamation_and_second_employee_cannot(): void
    {
        $departement = Departement::query()->create(['name' => 'Support']);
        $firstEmployee = User::factory()->create([
            'role' => 'employe',
            'departement_id' => $departement->id,
        ]);
        $secondEmployee = User::factory()->create([
            'role' => 'employe',
            'departement_id' => $departement->id,
        ]);

        $reclamation = Reclamation::query()->create([
            'title' => 'Probleme de connexion',
            'content' => 'Impossible de se connecter au portail.',
            'status' => 'en_attent',
            'latitude' => 33.5731,
            'longitude' => -7.5898,
            'departement_id' => $departement->id,
            'user_id' => $firstEmployee->id,
        ]);

        Sanctum::actingAs($firstEmployee);

        $firstResponse = $this->putJson("/api/reclamations/{$reclamation->id}", [
            'status' => 'en_cours',
        ]);

        $firstResponse
            ->assertOk()
            ->assertJsonPath('status', 'en_cours')
            ->assertJsonPath('assigned_to', $firstEmployee->id);

        Sanctum::actingAs($secondEmployee);

        $secondResponse = $this->putJson("/api/reclamations/{$reclamation->id}", [
            'status' => 'en_cours',
        ]);

        $secondResponse
            ->assertStatus(409)
            ->assertJsonPath('message', 'Cette reclamation est deja prise par un autre employe.');

        $this->assertDatabaseHas('reclamations', [
            'id' => $reclamation->id,
            'status' => 'en_cours',
            'assigned_to' => $firstEmployee->id,
        ]);
    }
}
