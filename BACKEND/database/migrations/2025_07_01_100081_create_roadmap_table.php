<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roadmap', function (Blueprint $table) {
            $table->engine = 'InnoDB';

            $table->id();
            $table->foreignId('bisnis_id')
                  ->constrained('bisnis')
                  ->cascadeOnDelete();

            $table->string('judul');
            $table->text('deskripsi')->nullable();

            // Target yang ingin dicapai (dipakai sebagai konteks AI What If)
            $table->string('target_metrik')->nullable(); // contoh: "omset", "jumlah_pembeli"
            $table->decimal('target_nilai', 15, 2)->nullable(); // contoh: 50000000
            $table->date('target_tanggal')->nullable(); // deadline target

            $table->enum('status', ['aktif', 'tercapai', 'dibatalkan'])->default('aktif');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roadmap');
    }
};
