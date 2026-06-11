<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'recipient_name')) {
                $table->string('recipient_name')->nullable()->after('quantity');
            }

            if (!Schema::hasColumn('order_items', 'bouquet_size')) {
                $table->string('bouquet_size')->nullable()->after('recipient_name');
            }

            if (!Schema::hasColumn('order_items', 'wrapping_color')) {
                $table->string('wrapping_color')->nullable()->after('bouquet_size');
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            foreach (['wrapping_color', 'bouquet_size', 'recipient_name'] as $column) {
                if (Schema::hasColumn('order_items', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
