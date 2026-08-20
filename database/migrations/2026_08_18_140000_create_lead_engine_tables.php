<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Lead Sources Table
        Schema::create('lead_sources', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type'); // first_party, ad_platform, web_discovery, import, api
            $table->string('status')->default('active'); // active, configured, available, connected, paused, error
            $table->string('category')->nullable(); // website, social, ads, public_web, referral
            $table->timestamp('last_synced_at')->nullable();
            $table->integer('records_fetched')->default(0);
            $table->integer('records_created')->default(0);
            $table->integer('duplicates_count')->default(0);
            $table->integer('errors_count')->default(0);
            $table->float('reliability_score')->default(95.0); // 0-100%
            $table->json('configuration')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Collection Jobs Table
        Schema::create('lead_collection_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_number')->unique();
            $table->foreignId('lead_source_id')->nullable()->constrained('lead_sources')->nullOnDelete();
            $table->string('source_name');
            $table->string('target_industry')->nullable();
            $table->string('target_location')->nullable();
            $table->string('target_company_size')->nullable();
            $table->string('target_service')->nullable();
            $table->string('target_website_filter')->nullable();
            $table->json('targeting_criteria')->nullable();
            $table->string('status')->default('pending'); // pending, running, completed, failed
            $table->integer('records_discovered')->default(0);
            $table->integer('records_extracted')->default(0);
            $table->integer('valid_leads')->default(0);
            $table->integer('duplicates_found')->default(0);
            $table->integer('errors_count')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('log_summary')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 3. Lead Review Queue Table
        Schema::create('lead_review_candidates', function (Blueprint $table) {
            $table->id();
            $table->string('candidate_number')->unique();
            $table->string('company_name');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->string('industry')->nullable();
            $table->string('location')->nullable();
            $table->string('service_opportunity')->nullable();
            $table->integer('qualification_score')->default(50);
            $table->string('review_category')->default('needs_review'); // needs_review, incomplete, duplicate, high_potential, invalid
            $table->string('validation_status')->default('Needs Review');
            $table->json('extracted_data')->nullable();
            $table->json('enriched_data')->nullable();
            $table->json('ai_inferences')->nullable();
            $table->json('website_signals')->nullable();
            $table->json('technology_stack')->nullable();
            $table->json('provenance')->nullable();
            $table->foreignId('matched_lead_id')->nullable()->constrained('contacts')->nullOnDelete();
            $table->integer('duplicate_match_confidence')->default(0); // 0-100%
            $table->foreignId('source_id')->nullable()->constrained('lead_sources')->nullOnDelete();
            $table->foreignId('job_id')->nullable()->constrained('lead_collection_jobs')->nullOnDelete();
            $table->string('status')->default('pending'); // pending, approved, rejected, merged
            $table->timestamps();
        });

        // 4. Lead Routing Rules Table
        Schema::create('lead_routing_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('service_type')->nullable();
            $table->integer('min_lead_score')->default(0);
            $table->string('location_filter')->nullable();
            $table->foreignId('assign_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('set_priority')->default('medium'); // high, medium, low
            $table->boolean('is_active')->default(true);
            $table->integer('priority_order')->default(0);
            $table->timestamps();
        });

        // 5. Lead Automation Logs Table
        Schema::create('lead_automation_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type'); // job_started, extraction, validation, deduplication, scoring, routing, approval
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('info'); // info, success, warning, error
            $table->json('metadata')->nullable();
            $table->foreignId('job_id')->nullable()->constrained('lead_collection_jobs')->nullOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained('contacts')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_automation_logs');
        Schema::dropIfExists('lead_routing_rules');
        Schema::dropIfExists('lead_review_candidates');
        Schema::dropIfExists('lead_collection_jobs');
        Schema::dropIfExists('lead_sources');
    }
};
