<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable,HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'departement_id'
        
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // relations

    public function departement()
    {
        return $this->belongsTo(Departement::class);
    }

    public function reclamations()
    {
        return $this->hasMany(Reclamation::class);
    }

    public function managedDapartement()
    {
        return $this->hasOne(Departement::class,'user_id');
    }
}