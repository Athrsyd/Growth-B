<?php

namespace App\Models;

use App\Models\DataHarian;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bisnis extends Model
{
    protected $table = 'bisnis';

    protected $fillable = [
        'user_id',
        'bisnis_nama',
        'bisnis_tipe',
        'bisnis_mulai',
        'bisnis_buka',
        'bisnis_tutup',
        'jumlah_pegawai',
        'target_market',
        'tujuan_bisnis',
        'QR_image_url',
        'reward_threshold',
    ];

    protected $casts = [
        'bisnis_mulai'   => 'date',
        'tujuan_bisnis'  => 'array',       // JSON → otomatis encode/decode
        'jumlah_pegawai' => 'integer',
    ];

    // -------------------------
    // Relationships
    // -------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function produk(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function dataHarian(): HasMany
    {
        return $this->hasMany(DataHarian::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function analisa(): HasMany
    {
        return $this->hasMany(Analisis::class);
    }

    // -------------------------
    // Helper / Accessor
    // -------------------------

    /**
     * Hitung laba bersih dari seluruh data harian.
     * Contoh pakai: $bisnis->totalLaba()
     */
    public function totalLaba(): float
    {
        return $this->dataHarian()
            ->selectRaw('SUM(pendapatan - pengeluaran) as laba')
            ->value('laba') ?? 0;
    }

    /**
     * Ambil member yang sudah memenuhi syarat reward.
     * Contoh pakai: $bisnis->membersEligibleForReward(10)
     */
    public function membersEligibleForReward(int $minCount = 10)
    {
        return $this->members()->where('member_count', '>=', $minCount)->get();
    }
}