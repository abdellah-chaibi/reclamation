<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reclamation extends Model
{
    /** @use HasFactory<\Database\Factories\ReclamationFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'status',
        'refusal_reason',
        'user_id',
        'departement_id',
        'assigned_to',
        'latitude',
        'longitude'
    ];

    // li dar reclamation
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // departement li ghadi t3aljha
    public function departement()
    {
        return $this->belongsTo(Departement::class);
    }

    public function assignedEmployee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // images dyal reclamation
    public function medias()
    {
        return $this->hasMany(Media::class);
    }
}
