<?php

namespace App\Models;
use App\Models\Bisnis;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
 
class DataHarian extends Model
{
    protected $table = 'data_harian';
 
    protected $fillable = [
        'bisnis_id',
        'is_libur',
        'tanggal',
        'pendapatan',
        'pengeluaran',
        'jumlah_pembeli',
        'produk_terlaris_id',
        'kendala',
        'note',
    ];
 
    protected $casts = [
        'tanggal'       => 'date',
        'pendapatan'    => 'decimal:2',
        'pengeluaran'   => 'decimal:2',
        'jumlah_pembeli'=> 'integer',
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
        return $this->belongsTo(Product::class, 'produk_terlaris_id');
    }
 
    // -------------------------
    // Helper / Accessor
    // -------------------------
 
    /**
     * Laba bersih hari ini (pendapatan - pengeluaran).
     * Contoh pakai: $dataHarian->laba
     */
    public function getLabaAttribute(): float
    {
        return (float) $this->pendapatan - (float) $this->pengeluaran;
    }
 
    /**
     * Rata-rata nilai transaksi per pembeli.
     * Contoh pakai: $dataHarian->rataRataTransaksi
     */
    public function getRataRataTransaksiAttribute(): float
    {
        if ($this->jumlah_pembeli === 0) return 0;
 
        return (float) $this->pendapatan / $this->jumlah_pembeli;
    }
 
    // -------------------------
    // Scope
    // -------------------------
 
    /**
     * Filter data dalam rentang tanggal tertentu.
     * Contoh pakai: DataHarian::periodeEvaluasi('2024-06-01', '2024-06-14')->get()
     */
    public function scopePeriodeEvaluasi($query, string $dari, string $sampai)
    {
        return $query->whereBetween('tanggal', [$dari, $sampai]);
    }}
