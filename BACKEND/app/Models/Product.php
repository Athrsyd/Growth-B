<?php

namespace App\Models;

use App\Models\DataHarian;
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
    ];
 
    protected $casts = [
        'produk_harga' => 'decimal:2',
    ];
 
    // -------------------------
    // Relationships
    // -------------------------
 
    public function bisnis(): BelongsTo
    {
        return $this->belongsTo(Bisnis::class);
    }
 
    /**
     * Data harian yang mencatat produk ini sebagai terlaris.
     */
    public function dataHarianTerlaris(): HasMany
    {
        return $this->hasMany(DataHarian::class, 'produk_terlaris_id');
    }
 
    // -------------------------
    // Helper / Accessor
    // -------------------------
 
    /**
     * Berapa kali produk ini tercatat sebagai terlaris.
     * Contoh pakai: $produk->totalHariTerlaris()
     */
    public function totalHariTerlaris(): int
    {
        return $this->dataHarianTerlaris()->count();
    }}
