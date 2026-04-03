<?php

namespace Tests\Feature;

use App\Models\Departement;
use App\Models\Reclamation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReclamationVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_see_all_reclamations(): void
    {
        [$support, $rh, $citizenA, $citizenB, $supportReclamation, $rhReclamation] = $this->seedVisibilityFixtures();
        $admin = User::factory()->create(['role' => 'admin']);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/reclamations');

        $response
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['id' => $supportReclamation->id])
            ->assertJsonFragment(['id' => $rhReclamation->id]);
    }

    public function test_employee_only_sees_reclamations_from_own_departement(): void
    {
        [$support, $rh, $citizenA, $citizenB, $supportReclamation, $rhReclamation] = $this->seedVisibilityFixtures();
        $employee = User::factory()->create([
            'role' => 'employe',
            'departement_id' => $support->id,
        ]);

        Sanctum::actingAs($employee);

        $response = $this->getJson('/api/reclamations');

        $response
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $supportReclamation->id])
            ->assertJsonMissing(['id' => $rhReclamation->id]);
    }

    public function test_chef_dep_only_sees_reclamations_from_own_departement(): void
    {
        [$support, $rh, $citizenA, $citizenB, $supportReclamation, $rhReclamation] = $this->seedVisibilityFixtures();
        $chef = User::factory()->create([
            'role' => 'chef_dep',
            'departement_id' => $support->id,
        ]);

        Sanctum::actingAs($chef);

        $response = $this->getJson('/api/reclamations');

        $response
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $supportReclamation->id])
            ->assertJsonMissing(['id' => $rhReclamation->id]);
    }

    public function test_citoyen_only_sees_their_own_reclamations(): void
    {
        [$support, $rh, $citizenA, $citizenB, $supportReclamation, $rhReclamation] = $this->seedVisibilityFixtures();

        Sanctum::actingAs($citizenA);

        $response = $this->getJson('/api/reclamations');

        $response
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $supportReclamation->id])
            ->assertJsonMissing(['id' => $rhReclamation->id]);
    }

    public function test_admin_can_filter_reclamations_by_departement(): void
    {
        [$support, $rh, $citizenA, $citizenB, $supportReclamation, $rhReclamation] = $this->seedVisibilityFixtures();
        $admin = User::factory()->create(['role' => 'admin']);

        Sanctum::actingAs($admin);

        $response = $this->getJson("/api/reclamations?departement_id={$rh->id}");

        $response
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $rhReclamation->id])
            ->assertJsonMissing(['id' => $supportReclamation->id]);
    }

    private function seedVisibilityFixtures(): array
    {
        $support = Departement::query()->create(['name' => 'Support']);
        $rh = Departement::query()->create(['name' => 'RH']);

        $citizenA = User::factory()->create(['role' => 'citoyen']);
        $citizenB = User::factory()->create(['role' => 'citoyen']);

        $supportReclamation = Reclamation::query()->create([
            'title' => 'Badge casse',
            'content' => 'Le badge ne fonctionne plus.',
            'status' => 'en_attent',
            'latitude' => 33.5731,
            'longitude' => -7.5898,
            'departement_id' => $support->id,
            'user_id' => $citizenA->id,
        ]);

        $rhReclamation = Reclamation::query()->create([
            'title' => 'Probleme salaire',
            'content' => 'Le bulletin est incorrect.',
            'status' => 'en_attent',
            'latitude' => 34.0209,
            'longitude' => -6.8416,
            'departement_id' => $rh->id,
            'user_id' => $citizenB->id,
        ]);

        return [$support, $rh, $citizenA, $citizenB, $supportReclamation, $rhReclamation];
    }
}
