<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SiteSetting extends Model
{
    protected $fillable = [
        'municipality_name',
        'email',
        'phone',
        'address_line_1',
        'address_line_2',
        'maps_url',
        'logo_path',
    ];

    protected $appends = [
        'logo_url',
    ];

    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) {
            return null;
        }

        $url = Storage::disk('public')->url($this->logo_path);

        if (!request()) {
            return $url;
        }

        $origin = request()->getSchemeAndHttpHost();

        if (Str::startsWith($url, ['http://', 'https://'])) {
            return preg_replace('#^https?://[^/]+#', $origin, $url);
        }

        return $origin.$url;
    }
}
