<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('edges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('canvas_id')->constrained('canvases')->cascadeOnDelete();
            $table->foreignId('source_node_id')->constrained('nodes')->cascadeOnDelete();
            $table->foreignId('target_node_id')->constrained('nodes')->cascadeOnDelete();
            $table->string('label')->nullable();
            $table->json('data')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edges');
    }
};
