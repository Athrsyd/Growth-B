<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('what_if', function (Blueprint $table) {
            $table->engine = 'InnoDB';

            $table->id();
            $table->foreignId('bisnis_id')
                  ->constrained('bisnis')
                  ->cascadeOnDelete();

            // Tipe skenario yang dianalisa
            $table->enum('tipe', ['produk', 'biaya', 'jam_operasional']);

            // Referensi produk (hanya diisi jika tipe = produk)
            $table->foreignId('produk_id')
                  ->nullable()
                  ->constrained('produk')
                  ->nullOnDelete();

            // Skenario yang diajukan user (disimpan sebagai JSON agar fleksibel per tipe)
            // produk:          { "perubahan": "naik", "nilai": 5000, "rating_manual": 8 }
            // biaya:           { "jenis_biaya": "bahan baku", "perubahan": "naik", "persen": 10 }
            // jam_operasional: { "buka_baru": "06:00", "tutup_baru": "22:00" }
            $table->json('skenario');

            // Hasil analisa dari Gemini
            $table->text('hasil_analisa');

            // Roadmap yang dijadikan acuan saat analisa (snapshot judul saja)
            $table->json('roadmap_acuan')->nullable(); // [{id, judul, target_metrik, target_nilai}]

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('what_if');
    }
};
