<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chatbot_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('chatbot_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('chatbot_categories')->nullOnDelete();
            $table->text('question');
            $table->text('answer');
            $table->json('keywords')->nullable();
            $table->string('intent')->nullable();
            $table->integer('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('intent');
            // Fulltext index only for MySQL - add manually: ALTER TABLE chatbot_entries ADD FULLTEXT(question, answer);
        });

        Schema::create('chatbot_synonyms', function (Blueprint $table) {
            $table->id();
            $table->string('word')->unique();
            $table->json('synonyms');
            $table->timestamps();
        });

        Schema::create('chatbot_flows', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('trigger_intent')->nullable();
            $table->json('trigger_keywords')->nullable();
            $table->json('steps'); // [{message, options: [{label, next_step}]}]
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('chatbot_conversations', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique();
            $table->string('visitor_name')->nullable();
            $table->string('visitor_email')->nullable();
            $table->string('visitor_ip')->nullable();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->enum('status', ['active', 'ended', 'escalated'])->default('active');
            $table->foreignId('converted_contact_id')->nullable()->constrained('contacts')->nullOnDelete();
            $table->integer('satisfaction_rating')->nullable();
            $table->timestamps();
        });

        Schema::create('chatbot_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('chatbot_conversations')->cascadeOnDelete();
            $table->enum('role', ['visitor', 'bot', 'agent']);
            $table->text('message');
            $table->foreignId('matched_entry_id')->nullable()->constrained('chatbot_entries')->nullOnDelete();
            $table->decimal('confidence_score', 5, 4)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('chatbot_unanswered', function (Blueprint $table) {
            $table->id();
            $table->text('question');
            $table->integer('occurrence_count')->default(1);
            $table->timestamp('last_asked_at')->useCurrent();
            $table->enum('status', ['pending', 'resolved', 'ignored'])->default('pending');
            $table->foreignId('resolved_entry_id')->nullable()->constrained('chatbot_entries')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('chatbot_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbot_settings');
        Schema::dropIfExists('chatbot_unanswered');
        Schema::dropIfExists('chatbot_messages');
        Schema::dropIfExists('chatbot_conversations');
        Schema::dropIfExists('chatbot_flows');
        Schema::dropIfExists('chatbot_synonyms');
        Schema::dropIfExists('chatbot_entries');
        Schema::dropIfExists('chatbot_categories');
    }
};
