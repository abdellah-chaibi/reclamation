<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table("users", function (Blueprint $table) {
            $table->string("cin")->nullable();
            $table->foreignId("departement_id")->nullable()->constrained("departements");
            $table->enum("role", ["citoyen", "employe", "chef_dep", "admin"])->default("citoyen");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    //
    }
};
