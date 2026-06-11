<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->text('campus_address')->nullable()->after('phone');
            $table->string('api_token', 80)->nullable()->unique()->after('remember_token');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_id')->nullable()->index();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('product_name');
            $table->decimal('product_price', 12, 2);
            $table->string('image')->nullable();
            $table->string('category')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->string('recipient_name')->nullable();
            $table->string('bouquet_size')->nullable();
            $table->string('wrapping_color')->nullable();
            $table->json('extras')->nullable();
            $table->text('gift_message')->nullable();
            $table->timestamps();

            $table->index(['session_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'campus_address', 'api_token']);
        });
    }
};
