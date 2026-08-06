<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produk', function (Blueprint $table) {
            $table->engine = 'InnoDB';

            $table->id();
            $table->foreignId('bisnis_id')
                ->constrained('bisnis')
                ->cascadeOnDelete();

            $table->string('produk_nama');
            $table->decimal('produk_harga', 15, 2);

            $table->string('produk_image_url')->nullable();
            $table->decimal('net_profit_margin', 5, 2)
                ->nullable()
                ->comment('Net Profit Margin dalam persen (0-100)');


            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produk');
    }
};
