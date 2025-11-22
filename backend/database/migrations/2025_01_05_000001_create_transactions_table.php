<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->enum('type', ['buy', 'sell']);
            $table->decimal('quantity', 28, 12);
            $table->decimal('price', 18, 8); // price in euro at time of transaction
            $table->dateTime('date');
        });
    }
    public function down()
    {
        Schema::dropIfExists('transactions');
    }
};
