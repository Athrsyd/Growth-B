<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Analisis extends Model
{
    protected $table = 'analisa';

    protected $fillable = [
        'bisnis_id',
        'tipe_eval',
        'pesan',
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

    /**
     * Filter hanya hasil evaluasi.
     * Contoh pakai: Analisa::evaluasi()->latest()->first()
     */
    public function scopeEvaluasi($query)
    {
        return $query->where('tipe_eval', 'eval');
    }

    /**
     * Filter hanya rekomendasi/plan.
     * Contoh pakai: Analisa::rencana()->latest()->first()
     */
    public function scopeRencana($query)
    {
        return $query->where('tipe_eval', 'plan');
    }
}
