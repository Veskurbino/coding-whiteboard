<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('canvas_id')->nullable()->constrained('canvases')->nullOnDelete();
            $table->string('model')->default('gemini-1.5-flash');
            $table->text('input_summary')->nullable();
            $table->longText('input_json');
            $table->longText('response_text')->nullable();
            $table->json('metadata')->nullable();
            $table->string('status')->default('completed'); // completed|error
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analyses');
    }
};
