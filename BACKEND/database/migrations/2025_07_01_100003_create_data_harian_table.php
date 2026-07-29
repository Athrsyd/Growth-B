<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_harian', function (Blueprint $table) {
            $table->engine = 'InnoDB';

            $table->id();
            $table->foreignId('bisnis_id')
                  ->constrained('bisnis')
                  ->cascadeOnDelete();

            $table->date('tanggal');
            $table->decimal('pendapatan', 15, 2);
            $table->decimal('pengeluaran', 15, 2);
            $table->integer('jumlah_pembeli');

            // FK ditulis manual agar nullable + nullOnDelete berjalan benar
            $table->unsignedBigInteger('produk_terlaris_id')->nullable();

            $table->text('kendala')->nullable();
            $table->text('note')->nullable();

            $table->timestamps();

            // FK ditaruh SETELAH semua kolom didefinisikan
            $table->foreign('produk_terlaris_id')
                  ->references('id')
                  ->on('produk')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_harian');
    }
};
