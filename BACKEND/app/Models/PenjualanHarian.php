<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenjualanHarian extends Model
{
    protected $table = 'penjualan_harian';

    protected $fillable = [
        'data_harian_id',
        'produk_id',
        'qty',
    ];

    protected $casts = [
        'qty' => 'integer',
    ];

    // -------------------------
    // Relationships
    // -------------------------

    public function dataHarian(): BelongsTo
    {
        return $this->belongsTo(DataHarian::class);
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // -------------------------
    // Accessor
    // -------------------------

    /**
     * Total pendapatan dari produk ini (qty × harga).
     * Contoh: $penjualan->total_pendapatan
     */
    public function getTotalPendapatanAttribute(): float
    {
        return $this->qty * (float) ($this->produk?->produk_harga ?? 0);
    }

    /**
     * Estimasi laba dari produk ini berdasarkan NPM.
     * Hanya tersedia jika produk memiliki net_profit_margin.
     * Contoh: $penjualan->estimasi_laba
     */
    public function getEstimasiLabaAttribute(): ?float
    {
        if (!$this->produk?->net_profit_margin) return null;

        return $this->total_pendapatan * ($this->produk->net_profit_margin / 100);
    }
}