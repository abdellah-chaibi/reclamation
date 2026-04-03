<?php

namespace Tests\Feature;

use App\Models\Departement;
use App\Models\Reclamation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChefReorientReclamationTest extends TestCase
{
    use RefreshDatabase;

    public function test_chef_dep_can_reorient_reclamation_to_another_departement(): void
    {
        $support = Departement::query()->create(['name' => 'Support']);
        $rh = Departement::query()->create(['name' => 'RH']);

        $chef = User::factory()->create([
            'role' => 'chef_dep',
            'departement_id' => $support->id,
        ]);

        $citizen = User::factory()->create(['role' => 'citoyen']);

        $reclamation = Reclamation::query()->create([
            'title' => 'Probleme administratif',
            'content' => 'La reclamation doit etre redirigee.',
            'status' => 'en_attent',
            'latitude' => 33.5731,
            'longitude' => -7.5898,
            'departement_id' => $support->id,
            'user_id' => $citizen->id,
        ]);

        Sanctum::actingAs($chef);

        $response = $this->putJson("/api/reclamations/{$reclamation->id}", [
            'departement_id' => $rh->id,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('departement_id', $rh->id)
            ->assertJsonPath('assigned_to', null);

        $this->assertDatabaseHas('reclamations', [
            'id' => $reclamation->id,
            'departement_id' => $rh->id,
            'assigned_to' => null,
        ]);
    }

    public function test_chef_dep_cannot_reorient_reclamation_from_another_departement(): void
    {
        $support = Departement::query()->create(['name' => 'Support']);
        $rh = Departement::query()->create(['name' => 'RH']);

        $chef = User::factory()->create([
            'role' => 'chef_dep',
            'departement_id' => $support->id,
        ]);

        $citizen = User::factory()->create(['role' => 'citoyen']);

        $reclamation = Reclamation::query()->create([
            'title' => 'Probleme administratif',
            'content' => 'La reclamation ne depend pas de ce chef.',
            'status' => 'en_attent',
            'latitude' => 33.5731,
            'longitude' => -7.5898,
            'departement_id' => $rh->id,
            'user_id' => $citizen->id,
        ]);

        Sanctum::actingAs($chef);

        $response = $this->putJson("/api/reclamations/{$reclamation->id}", [
            'departement_id' => $support->id,
        ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('reclamations', [
            'id' => $reclamation->id,
            'departement_id' => $rh->id,
        ]);
    }
}
