<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('cryptocurrency_id')->constrained('cryptocurrencies')->onDelete('cascade');
            $table->decimal('amount', 28, 12)->default(0);
            $table->timestamps();
        });
    }
    public function down()
    {
        Schema::dropIfExists('wallets');
    }
};
