<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $table = 'produk';

    protected $fillable = [
        'bisnis_id',
        'produk_nama',
        'produk_harga',
        'net_profit_margin',
        'produk_image_url',
    ];

    protected $casts = [
        'produk_harga'      => 'decimal:2',
        'net_profit_margin' => 'decimal:2',
    ];

    // -------------------------
    // Relationships
    // -------------------------

    public function bisnis(): BelongsTo
    {
        return $this->belongsTo(Bisnis::class);
    }

    public function dataHarianTerlaris(): HasMany
    {
        return $this->hasMany(DataHarian::class, 'produk_terlaris_id');
    }

    public function penjualanHarian(): HasMany
    {
        return $this->hasMany(PenjualanHarian::class);
    }

    // -------------------------
    // Helper
    // -------------------------

    public function totalHariTerlaris(): int
    {
        return $this->dataHarianTerlaris()->count();
    }

    public function totalQtyTerjual(): int
    {
        return $this->penjualanHarian()->sum('qty');
    }
}
