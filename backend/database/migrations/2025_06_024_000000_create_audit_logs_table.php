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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('auditable_type'); // Model class name
            $table->unsignedBigInteger('auditable_id'); // Model ID
            $table->string('event'); // created, updated, deleted
            $table->json('old_values')->nullable(); // Old values in JSON format
            $table->json('new_values')->nullable(); // New values in JSON format
            $table->unsignedBigInteger('user_id')->nullable(); // User who made the change
            $table->string('user_name')->nullable(); // User name for quick reference
            $table->string('ip_address', 45)->nullable(); // IP address
            $table->text('user_agent')->nullable(); // Browser/client info
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index(['auditable_type', 'auditable_id']);
            $table->index('user_id');
            $table->index('event');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};