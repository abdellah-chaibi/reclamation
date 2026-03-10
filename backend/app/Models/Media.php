<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    /** @use HasFactory<\Database\Factories\MediaFactory> */
    use HasFactory;

    protected $fillable = [
        'filename',
        'path',
        'reclamation_id'
    ];

    public function reclamation()
    {
        return $this->belongsTo(Reclamation::class);
    }
}
