<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DataHarian extends Model
{
    protected $table = 'data_harian';

    protected $fillable = [
        'bisnis_id',
        'tanggal',
        'pendapatan',
        'pengeluaran',
        'jumlah_pembeli',
        'produk_terlaris_id',
        'kendala',
        'note',
    ];

    protected $casts = [
        'tanggal'        => 'date',
        'pendapatan'     => 'decimal:2',
        'pengeluaran'    => 'decimal:2',
        'jumlah_pembeli' => 'integer',
    ];

    // -------------------------
    // Relationships
    // -------------------------

    public function bisnis(): BelongsTo
    {
        return $this->belongsTo(Bisnis::class);
    }

    public function produkTerlaris(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_terlaris_id');
    }

    public function penjualanHarian(): HasMany
    {
        return $this->hasMany(PenjualanHarian::class);
    }

    // -------------------------
    // Accessor
    // -------------------------

    public function getLabaAttribute(): float
    {
        return (float) $this->pendapatan - (float) $this->pengeluaran;
    }

    public function getRataRataTransaksiAttribute(): float
    {
        if ($this->jumlah_pembeli === 0) return 0;
        return (float) $this->pendapatan / $this->jumlah_pembeli;
    }

    // -------------------------
    // Scope
    // -------------------------

    public function scopePeriodeEvaluasi($query, string $dari, string $sampai)
    {
        return $query->whereBetween('tanggal', [$dari, $sampai]);
    }
}
