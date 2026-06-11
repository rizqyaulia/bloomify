<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->string('customer_name');
            $table->string('phone');
            $table->text('campus_address');
            $table->date('delivery_date')->nullable();
            $table->string('delivery_time')->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('delivery_fee', 12, 2)->default(0);
            $table->decimal('service_fee', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('payment_status')->default('pending')->index();
            $table->string('order_status')->default('order_created')->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['created_at', 'order_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
