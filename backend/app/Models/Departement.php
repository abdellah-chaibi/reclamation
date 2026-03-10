<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Departement extends Model
{
    /** @use HasFactory<\Database\Factories\DepartementFactory> */
    protected $fillable = [
        'name',
        'user_id'
    ];

    // chef departement
    public function chef()
    {
        return $this->hasOne(User::class,'user_id');
    }

    // users dyal departement
    public function users()
    {
        return $this->hasMany(User::class);
    }

    // reclamations dyal departement
    public function reclamations()
    {
        return $this->hasMany(Reclamation::class);
    }
}