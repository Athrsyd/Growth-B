<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
 
class Member extends Model
{
  protected $table = 'members';
 
    protected $fillable = [
        'bisnis_id',
        'member_phone',
        'member_count',
    ];
 
    protected $casts = [
        'member_count' => 'integer',
    ];
 
    // -------------------------
    // Relationships
    // -------------------------
 
    public function bisnis(): BelongsTo
    {
        return $this->belongsTo(Bisnis::class);
    }
 
    // -------------------------
    // Helper / Accessor
    // -------------------------
 
    /**
     * Cek apakah member sudah memenuhi syarat reward.
     * Contoh pakai: $member->isEligibleForReward(10)
     */
    public function isEligibleForReward(int $minCount = 10): bool
    {
        return $this->member_count >= $minCount;
    }
 
    /**
     * Tambah 1 kunjungan saat member scan QR.
     * Contoh pakai: $member->tambahKunjungan()
     */
    public function tambahKunjungan(): void
    {
        $this->increment('member_count');
    }
 
    // -------------------------
    // Scope
    // -------------------------
 
    /**
     * Filter member yang sudah layak dapat reward.
     * Contoh pakai: Member::layakReward(10)->get()
     */
    public function scopeLayakReward($query, int $minCount = 10)
    {
        return $query->where('member_count', '>=', $minCount);
    }}
