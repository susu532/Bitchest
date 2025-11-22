<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('crypto_prices', function (Blueprint $table) {
            $table->id();
            $table->string('crypto_id');
            $table->foreign('crypto_id')->references('id')->on('cryptocurrencies')->onDelete('cascade');
            $table->date('price_date');
            $table->decimal('price', 18, 2);
            $table->timestamps();
            $table->unique(['crypto_id', 'price_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crypto_prices');
    }
};
