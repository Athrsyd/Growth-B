<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analisa', function (Blueprint $table) {
            $table->engine = 'InnoDB';

            $table->id();
            $table->foreignId('bisnis_id')
                  ->constrained('bisnis')
                  ->cascadeOnDelete();

            $table->enum('tipe_eval', ['eval', 'plan']);
            $table->text('pesan');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analisa');
    }
};
