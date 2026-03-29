<?php

namespace Tests\Feature;

use App\Models\Departement;
use App\Models\Reclamation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RefuseReclamationTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_refuse_a_reclamation_with_a_reason(): void
    {
        $departement = Departement::query()->create(['name' => 'Support']);
        $employee = User::factory()->create([
            'role' => 'employe',
            'departement_id' => $departement->id,
        ]);

        $reclamation = Reclamation::query()->create([
            'title' => 'Connexion impossible',
            'content' => 'Le badge ne fonctionne plus.',
            'status' => 'en_attent',
            'latitude' => 33.5731,
            'longitude' => -7.5898,
            'departement_id' => $departement->id,
            'user_id' => $employee->id,
        ]);

        Sanctum::actingAs($employee);

        $response = $this->patchJson("/api/reclamations/{$reclamation->id}/refuse", [
            'refusal_reason' => 'La reclamation est incomplete et ne contient pas assez de details.',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.status', 'rejete')
            ->assertJsonPath(
                'data.refusal_reason',
                'La reclamation est incomplete et ne contient pas assez de details.'
            );

        $this->assertDatabaseHas('reclamations', [
            'id' => $reclamation->id,
            'status' => 'rejete',
            'refusal_reason' => 'La reclamation est incomplete et ne contient pas assez de details.',
        ]);
    }

    public function test_refusal_reason_is_required_when_refusing_a_reclamation(): void
    {
        $departement = Departement::query()->create(['name' => 'RH']);
        $employee = User::factory()->create([
            'role' => 'employe',
            'departement_id' => $departement->id,
        ]);

        $reclamation = Reclamation::query()->create([
            'title' => 'Probleme de pointage',
            'content' => 'Le pointage ne remonte pas.',
            'status' => 'en_attent',
            'latitude' => 34.0209,
            'longitude' => -6.8416,
            'departement_id' => $departement->id,
            'user_id' => $employee->id,
        ]);

        Sanctum::actingAs($employee);

        $response = $this->patchJson("/api/reclamations/{$reclamation->id}/refuse", [
            'refusal_reason' => '',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['refusal_reason']);

        $this->assertDatabaseHas('reclamations', [
            'id' => $reclamation->id,
            'status' => 'en_attent',
            'refusal_reason' => null,
        ]);
    }

    public function test_non_employee_cannot_refuse_a_reclamation(): void
    {
        $departement = Departement::query()->create(['name' => 'RH']);
        $chef = User::factory()->create([
            'role' => 'chef_dep',
            'departement_id' => $departement->id,
        ]);
        $employee = User::factory()->create([
            'role' => 'employe',
            'departement_id' => $departement->id,
        ]);

        $reclamation = Reclamation::query()->create([
            'title' => 'Probleme materiel',
            'content' => 'Le poste de travail a besoin de maintenance.',
            'status' => 'en_attent',
            'latitude' => 33.9716,
            'longitude' => -6.8498,
            'departement_id' => $departement->id,
            'user_id' => $employee->id,
        ]);

        Sanctum::actingAs($chef);

        Sanctum::actingAs($chef);

        $response = $this->patchJson("/api/reclamations/{$reclamation->id}/refuse", [
            'refusal_reason' => 'Raison qui ne devrait jamais etre acceptee.',
        ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('reclamations', [
            'id' => $reclamation->id,
            'status' => 'en_attent',
            'refusal_reason' => null,
        ]);
    }
}
