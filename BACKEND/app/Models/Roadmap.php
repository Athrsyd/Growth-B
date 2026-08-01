<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Roadmap extends Model
{
    protected $table = 'roadmap';

    protected $fillable = [
        'bisnis_id',
        'judul',
        'deskripsi',
        'target_metrik',
        'target_nilai',
        'target_tanggal',
        'status',
    ];

    protected $casts = [
        'target_nilai'   => 'decimal:2',
        'target_tanggal' => 'date',
    ];

    // -------------------------
    // Relationships
    // -------------------------

    public function bisnis(): BelongsTo
    {
        return $this->belongsTo(Bisnis::class);
    }

    // -------------------------
    // Scope
    // -------------------------

    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }
}
