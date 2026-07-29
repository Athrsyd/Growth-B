<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bisnis', function (Blueprint $table) {
            $table->engine = 'InnoDB';

            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->string('bisnis_nama');
            $table->enum('bisnis_tipe', ['barang', 'jasa']);
            $table->date('bisnis_mulai');
            $table->time('bisnis_buka');
            $table->time('bisnis_tutup');
            $table->integer('jumlah_pegawai');
            $table->string('target_market');
            $table->json('tujuan_bisnis');
            $table->string('QR_image_url')->nullable();
             // Threshold kunjungan untuk dapat reward, null = fitur belum diaktifkan
            $table->integer('reward_threshold')->nullable();
 
            // Token unik untuk QR membership
            $table->string('member_token', 32)->nullable()->unique();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bisnis');
    }
};
