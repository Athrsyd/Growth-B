<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatIf extends Model
{
    protected $table = 'what_if';

    protected $fillable = [
        'bisnis_id',
        'tipe',
        'produk_id',
        'skenario',
        'hasil_analisa',
        'roadmap_acuan',
    ];

    protected $casts = [
        'skenario'       => 'array',
        'roadmap_acuan'  => 'array',
    ];

    // -------------------------
    // Relationships
    // -------------------------

    public function bisnis(): BelongsTo
    {
        return $this->belongsTo(Bisnis::class);
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // -------------------------
    // Scope
    // -------------------------

    /**
     * Hitung penggunaan What If hari ini untuk bisnis tertentu.
     */
    public function scopeHariIni($query)
    {
        return $query->whereDate('created_at', today());
    }
}
