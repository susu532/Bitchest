<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('crypto_id');
            $table->foreign('crypto_id')->references('id')->on('cryptocurrencies')->onDelete('cascade');
            $table->decimal('quantity', 18, 8);
            $table->decimal('price_per_unit', 18, 2);
            $table->enum('type', ['buy', 'sell']);
            $table->timestamp('transaction_date');
            $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
