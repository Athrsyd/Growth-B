<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penjualan_harian', function (Blueprint $table) {
            $table->engine = 'InnoDB';

            $table->id();
            $table->foreignId('data_harian_id')
                  ->constrained('data_harian')
                  ->cascadeOnDelete();
            $table->foreignId('produk_id')
                  ->constrained('produk')
                  ->cascadeOnDelete();

            $table->integer('qty'); // jumlah terjual

            $table->timestamps();

            // Satu produk hanya bisa muncul sekali per data harian
            $table->unique(['data_harian_id', 'produk_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penjualan_harian');
    }
};