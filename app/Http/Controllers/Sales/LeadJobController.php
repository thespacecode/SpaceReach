<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\LeadAutomationLog;
use App\Models\LeadCollectionJob;
use App\Models\LeadReviewCandidate;
use App\Models\LeadSource;
use App\Services\LeadEngine\DiscoveryService;
use App\Services\LeadEngine\LeadPipelineRunner;
use App\Services\LeadEngine\ScraperExtractorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadJobController extends Controller
{
    protected DiscoveryService $discoveryService;
    protected ScraperExtractorService $extractor;
    protected LeadPipelineRunner $pipelineRunner;

    public function __construct(
        DiscoveryService $discoveryService,
        ScraperExtractorService $extractor,
        LeadPipelineRunner $pipelineRunner
    ) {
        $this->discoveryService = $discoveryService;
        $this->extractor = $extractor;
        $this->pipelineRunner = $pipelineRunner;
    }

    /**
     * Display Collection Jobs and Review Queue combined in one unified tab page.
     */
    public function index(Request $request)
    {
        $activeTab = $request->input('tab', 'jobs');
        $category = $request->input('category', 'all');

        // 1. Fetch Collection Jobs
        $jobs = LeadCollectionJob::with(['source', 'creator', 'candidates', 'logs'])
            ->orderBy('id', 'desc')
            ->paginate(15, ['*'], 'jobs_page');

        // Seed initial sample jobs if database is empty
        if ($jobs->isEmpty()) {
            $sampleSource = LeadSource::first();
            $sourceId = $sampleSource ? $sampleSource->id : null;

            $initialJobs = [
                [
                    'job_number' => 'JOB-1048',
                    'lead_source_id' => $sourceId,
                    'source_name' => 'Public Business Directory',
                    'target_industry' => 'Real Estate',
                    'target_location' => 'Bhubaneswar',
                    'target_company_size' => '10–500 employees',
                    'target_service' => 'Website Development',
                    'target_website_filter' => 'Has website',
                    'targeting_criteria' => [
                        'Location' => 'Bhubaneswar',
                        'Industry' => 'Real Estate',
                        'Company Size' => '10–500 employees',
                        'Services' => 'Website Development, Digital Marketing, AI Automation',
                        'Business Status' => 'Active',
                    ],
                    'status' => 'completed',
                    'records_discovered' => 1842,
                    'records_extracted' => 1420,
                    'valid_leads' => 892,
                    'duplicates_found' => 311,
                    'errors_count' => 27,
                    'started_at' => now()->subHours(2),
                    'completed_at' => now()->subHours(1),
                    'log_summary' => [
                        'Status' => 'Pipeline Execution Finished',
                        'Duration' => '42 mins',
                        'Target Market' => 'Bhubaneswar Real Estate',
                    ],
                ],
                [
                    'job_number' => 'JOB-1047',
                    'lead_source_id' => $sourceId,
                    'source_name' => 'Company Websites Discovery',
                    'target_industry' => 'Healthcare & Clinics',
                    'target_location' => 'Bhubaneswar',
                    'target_company_size' => 'Any',
                    'target_service' => 'AI Automation',
                    'target_website_filter' => 'Has website',
                    'targeting_criteria' => [
                        'Location' => 'Bhubaneswar',
                        'Industry' => 'Healthcare',
                        'Service' => 'AI Automation (24/7 Consultation Bot)',
                    ],
                    'status' => 'completed',
                    'records_discovered' => 620,
                    'records_extracted' => 540,
                    'valid_leads' => 412,
                    'duplicates_found' => 84,
                    'errors_count' => 12,
                    'started_at' => now()->subDays(1),
                    'completed_at' => now()->subDays(1)->addMinutes(18),
                    'log_summary' => [
                        'Status' => 'Completed',
                        'Duration' => '18 mins',
                    ],
                ],
            ];

            foreach ($initialJobs as $j) {
                $createdJob = LeadCollectionJob::create($j);

                // Seed initial extracted candidates for sample job
                LeadReviewCandidate::create([
                    'candidate_number' => 'CAN-' . rand(1000, 9999),
                    'company_name' => 'Kalinga Realty Group',
                    'first_name' => 'Sanjay',
                    'last_name' => 'Pattnaik',
                    'email' => 'sanjay@kalingarealty.com',
                    'phone' => '+91 98610 55443',
                    'website' => 'https://kalingarealty.com',
                    'industry' => $createdJob->target_industry,
                    'location' => $createdJob->target_location . ', Odisha',
                    'service_opportunity' => $createdJob->target_service,
                    'qualification_score' => 88,
                    'review_category' => 'high_potential',
                    'validation_status' => 'Valid',
                    'job_id' => $createdJob->id,
                    'source_id' => $createdJob->lead_source_id,
                    'extracted_data' => ['company_name' => 'Kalinga Realty Group', 'phone' => '+91 98610 55443'],
                    'technology_stack' => ['WordPress', 'Google Tag Manager', 'PHP'],
                    'provenance' => ['source_url' => 'https://kalingarealty.com', 'confidence' => 'High'],
                    'status' => 'pending',
                ]);

                LeadReviewCandidate::create([
                    'candidate_number' => 'CAN-' . rand(1000, 9999),
                    'company_name' => 'SmartCity Infrastructure',
                    'first_name' => 'Rashmi',
                    'last_name' => 'Ranjan',
                    'email' => 'contact@smartcity-builders.com',
                    'phone' => '+91 94370 11223',
                    'website' => 'https://smartcity-builders.com',
                    'industry' => $createdJob->target_industry,
                    'location' => $createdJob->target_location . ', Odisha',
                    'service_opportunity' => $createdJob->target_service,
                    'qualification_score' => 74,
                    'review_category' => 'needs_review',
                    'validation_status' => 'Needs Review',
                    'job_id' => $createdJob->id,
                    'source_id' => $createdJob->lead_source_id,
                    'extracted_data' => ['company_name' => 'SmartCity Infrastructure'],
                    'technology_stack' => ['HTML5', 'Bootstrap'],
                    'provenance' => ['source_url' => 'https://smartcity-builders.com', 'confidence' => 'Medium'],
                    'status' => 'pending',
                ]);

                // Seed sample logs
                LeadAutomationLog::create([
                    'event_type' => 'job_started',
                    'title' => "Discovery Extraction Job Started",
                    'description' => "Job #{$createdJob->job_number} initiated targeting {$createdJob->target_industry} in {$createdJob->target_location}.",
                    'status' => 'info',
                    'job_id' => $createdJob->id,
                ]);

                LeadAutomationLog::create([
                    'event_type' => 'discovery',
                    'title' => "Target Destinations Crawled",
                    'description' => "Discovered {$createdJob->records_discovered} target domains and extracted metadata.",
                    'status' => 'info',
                    'job_id' => $createdJob->id,
                ]);

                LeadAutomationLog::create([
                    'event_type' => 'job_completed',
                    'title' => "Extraction Execution Finished",
                    'description' => "Completed extracting {$createdJob->records_extracted} records. {$createdJob->valid_leads} valid leads identified.",
                    'status' => 'success',
                    'job_id' => $createdJob->id,
                ]);
            }

            $jobs = LeadCollectionJob::with(['source', 'creator', 'candidates', 'logs'])
                ->orderBy('id', 'desc')
                ->paginate(15, ['*'], 'jobs_page');
        }

        // 2. Fetch Review Candidates Queue
        $candidateQuery = LeadReviewCandidate::with(['matchedLead', 'source', 'job'])
            ->where('status', 'pending');

        if ($category !== 'all') {
            $candidateQuery->where('review_category', $category);
        }

        $candidates = $candidateQuery->orderBy('id', 'desc')->paginate(15, ['*'], 'candidates_page')->withQueryString();

        // Seed initial review candidates if empty
        if ($candidates->total() === 0 && $category === 'all') {
            $sampleLead = Contact::first();
            $matchedId = $sampleLead ? $sampleLead->id : null;

            $initialCandidates = [
                [
                    'candidate_number' => 'CAN-8092',
                    'company_name' => 'ABC Developers Pvt Ltd',
                    'first_name' => 'Rajesh',
                    'last_name' => 'Mohanty',
                    'email' => 'rajesh@abcdevelopers.com',
                    'phone' => '+91 98610 12345',
                    'website' => 'https://abcdevelopers.com',
                    'industry' => 'Real Estate',
                    'location' => 'Bhubaneswar, Odisha',
                    'service_opportunity' => 'Website Development',
                    'qualification_score' => 88,
                    'review_category' => 'duplicate',
                    'validation_status' => 'Needs Review',
                    'duplicate_match_confidence' => 94,
                    'matched_lead_id' => $matchedId,
                    'extracted_data' => ['company_name' => 'ABC Developers Pvt Ltd', 'phone' => '+91 98610 12345'],
                    'provenance' => ['source_url' => 'https://abcdevelopers.com', 'source_type' => 'Web Discovery', 'confidence' => 'High'],
                    'status' => 'pending',
                ],
                [
                    'candidate_number' => 'CAN-8093',
                    'company_name' => 'Kalinga Tech Labs',
                    'first_name' => 'Priya',
                    'last_name' => 'Sharma',
                    'email' => 'priya@kalingatech.io',
                    'phone' => '+91 94370 99887',
                    'website' => 'https://kalingatech.io',
                    'industry' => 'IT Services',
                    'location' => 'Infocity, Bhubaneswar',
                    'service_opportunity' => 'AI Automation',
                    'qualification_score' => 92,
                    'review_category' => 'high_potential',
                    'validation_status' => 'Valid',
                    'duplicate_match_confidence' => 0,
                    'extracted_data' => ['company_name' => 'Kalinga Tech Labs', 'phone' => '+91 94370 99887'],
                    'provenance' => ['source_url' => 'https://kalingatech.io', 'source_type' => 'LinkedIn Lead Form', 'confidence' => 'High'],
                    'status' => 'pending',
                ],
                [
                    'candidate_number' => 'CAN-8094',
                    'company_name' => 'Odisha Commercial Ventures',
                    'first_name' => 'Amit',
                    'last_name' => 'Das',
                    'email' => 'info@odishaventures.co.in',
                    'phone' => '+91 99371 44332',
                    'website' => 'https://odishaventures.co.in',
                    'industry' => 'Trading',
                    'location' => 'Cuttack, Odisha',
                    'service_opportunity' => 'Digital Marketing',
                    'qualification_score' => 45,
                    'review_category' => 'needs_review',
                    'validation_status' => 'Incomplete',
                    'duplicate_match_confidence' => 0,
                    'extracted_data' => ['company_name' => 'Odisha Commercial Ventures'],
                    'provenance' => ['source_url' => 'https://odishaventures.co.in', 'source_type' => 'Public Business Directory', 'confidence' => 'Medium'],
                    'status' => 'pending',
                ],
            ];

            foreach ($initialCandidates as $c) {
                LeadReviewCandidate::create($c);
            }

            $candidates = LeadReviewCandidate::with(['matchedLead', 'source', 'job'])
                ->where('status', 'pending')
                ->orderBy('id', 'desc')
                ->paginate(15, ['*'], 'candidates_page');
        }

        $allPending = LeadReviewCandidate::where('status', 'pending')->get();

        $counts = [
            'needs_review' => $allPending->where('review_category', 'needs_review')->count(),
            'incomplete' => $allPending->where('review_category', 'incomplete')->count(),
            'duplicate' => $allPending->where('review_category', 'duplicate')->count(),
            'high_potential' => $allPending->where('review_category', 'high_potential')->count(),
            'invalid' => $allPending->where('review_category', 'invalid')->count(),
            'total' => $allPending->count(),
        ];

        $qualityMetrics = [
            'total_records' => 18421,
            'valid' => 16820,
            'needs_review' => 842,
            'duplicates' => 531,
            'incomplete' => 228,
            'invalid' => 74,
            'validation_rate' => 91.3,
            'duplicate_rate' => 2.9,
            'enrichment_rate' => 88.5,
            'missing_email_rate' => 4.2,
            'missing_phone_rate' => 6.1,
            'source_reliability' => 95.8,
        ];

        $sourcePerformance = [
            [
                'source' => 'TheSpaceCode Website Forms',
                'leads' => 842,
                'qualified' => 184,
                'won' => 28,
                'revenue' => '₹42,00,000',
                'roi' => '420%',
                'status' => 'Active',
            ],
            [
                'source' => 'Google Ads Campaigns',
                'leads' => 621,
                'qualified' => 142,
                'won' => 21,
                'revenue' => '₹31,00,000',
                'roi' => '310%',
                'status' => 'Active',
            ],
            [
                'source' => 'Client Referrals',
                'leads' => 184,
                'qualified' => 86,
                'won' => 24,
                'revenue' => '₹48,00,000',
                'roi' => '950%',
                'status' => 'Active',
            ],
            [
                'source' => 'LinkedIn Lead Gen Forms',
                'leads' => 302,
                'qualified' => 54,
                'won' => 8,
                'revenue' => '₹12,00,000',
                'roi' => '180%',
                'status' => 'Active',
            ],
            [
                'source' => 'Public Web Discovery',
                'leads' => 918,
                'qualified' => 76,
                'won' => 9,
                'revenue' => '₹14,00,000',
                'roi' => '240%',
                'status' => 'Active',
            ],
        ];

        $analyticsLogs = LeadAutomationLog::with('job', 'contact')
            ->orderBy('id', 'desc')
            ->take(20)
            ->get();

        return Inertia::render('Sales/Leads/Jobs', [
            'jobs' => $jobs,
            'candidates' => $candidates,
            'counts' => $counts,
            'sources' => $sources,
            'activeTab' => $activeTab,
            'activeCategory' => $category,
            'qualityMetrics' => $qualityMetrics,
            'sourcePerformance' => $sourcePerformance,
            'analyticsLogs' => $analyticsLogs,
        ]);
    }

    /**
     * Create and run a new Lead Discovery collection job.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'target_industry' => 'required|string|max:255',
            'target_location' => 'required|string|max:255',
            'target_service' => 'nullable|string|max:255',
            'target_company_size' => 'nullable|string|max:255',
            'target_website_filter' => 'nullable|string|max:255',
            'lead_source_id' => 'nullable|exists:lead_sources,id',
            'additional_criteria' => 'nullable|string',
        ]);

        $source = LeadSource::find($request->lead_source_id);
        $sourceName = $source ? $source->name : 'Public Web Discovery';

        $job = LeadCollectionJob::create([
            'job_number' => 'JOB-' . rand(1000, 9999),
            'lead_source_id' => $request->lead_source_id,
            'source_name' => $sourceName,
            'target_industry' => $validated['target_industry'],
            'target_location' => $validated['target_location'],
            'target_company_size' => $validated['target_company_size'] ?? '10–500 employees',
            'target_service' => $validated['target_service'] ?? 'Website Development',
            'target_website_filter' => $validated['target_website_filter'] ?? 'Has website',
            'targeting_criteria' => [
                'Industry' => $validated['target_industry'],
                'Location' => $validated['target_location'],
                'Service' => $validated['target_service'] ?? 'Website Development',
                'Company Size' => $validated['target_company_size'] ?? 'Any',
                'Website Filter' => $validated['target_website_filter'] ?? 'Has website',
                'Additional Criteria' => $validated['additional_criteria'] ?? 'Active business',
            ],
            'status' => 'pending',
            'created_by' => auth()->id(),
        ]);

        // Run discovery job pipeline synchronously for immediate feedback
        $this->discoveryService->executeJob($job);

        return redirect()->back()->with('success', "Discovery Job #{$job->job_number} created and executed successfully.");
    }

    /**
     * Update collection job settings / criteria.
     */
    public function update(Request $request, LeadCollectionJob $job)
    {
        $validated = $request->validate([
            'target_industry' => 'required|string|max:255',
            'target_location' => 'required|string|max:255',
            'target_service' => 'nullable|string|max:255',
            'target_company_size' => 'nullable|string|max:255',
            'target_website_filter' => 'nullable|string|max:255',
            'status' => 'required|string|in:pending,running,completed,failed,paused',
            'lead_source_id' => 'nullable|exists:lead_sources,id',
            'additional_criteria' => 'nullable|string',
        ]);

        $source = LeadSource::find($request->lead_source_id);
        $sourceName = $source ? $source->name : $job->source_name;

        $job->update([
            'lead_source_id' => $request->lead_source_id ?? $job->lead_source_id,
            'source_name' => $sourceName,
            'target_industry' => $validated['target_industry'],
            'target_location' => $validated['target_location'],
            'target_service' => $validated['target_service'] ?? $job->target_service,
            'target_company_size' => $validated['target_company_size'] ?? $job->target_company_size,
            'target_website_filter' => $validated['target_website_filter'] ?? $job->target_website_filter,
            'status' => $validated['status'],
            'targeting_criteria' => array_merge($job->targeting_criteria ?? [], [
                'Industry' => $validated['target_industry'],
                'Location' => $validated['target_location'],
                'Service' => $validated['target_service'] ?? $job->target_service,
                'Company Size' => $validated['target_company_size'] ?? $job->target_company_size,
                'Website Filter' => $validated['target_website_filter'] ?? $job->target_website_filter,
                'Additional Criteria' => $validated['additional_criteria'] ?? '',
            ]),
        ]);

        LeadAutomationLog::create([
            'event_type' => 'job_updated',
            'title' => "Job Config Updated (#{$job->job_number})",
            'description' => "Job parameters updated to Industry: '{$job->target_industry}', Location: '{$job->target_location}', Status: '{$job->status}'.",
            'status' => 'info',
            'job_id' => $job->id,
        ]);

        return redirect()->back()->with('success', "Collection Job #{$job->job_number} updated successfully.");
    }

    /**
     * Delete a collection job and clean up associated records.
     */
    public function destroy(LeadCollectionJob $job)
    {
        $jobNumber = $job->job_number;

        // Clean up linked candidate review records and logs
        $job->candidates()->delete();
        $job->logs()->delete();
        $job->delete();

        return redirect()->back()->with('success', "Collection Job #{$jobNumber} and its associated candidates deleted successfully.");
    }

    /**
     * Delete individual extracted candidate record from job.
     */
    public function destroyCandidate(LeadCollectionJob $job, LeadReviewCandidate $candidate)
    {
        $companyName = $candidate->company_name;
        $candidate->delete();

        if ($job->records_extracted > 0) {
            $job->decrement('records_extracted');
        }

        LeadAutomationLog::create([
            'event_type' => 'candidate_deleted',
            'title' => "Extracted Record Removed",
            'description' => "Candidate record '{$companyName}' deleted from Job #{$job->job_number}.",
            'status' => 'warning',
            'job_id' => $job->id,
        ]);

        return redirect()->back()->with('success', "Extracted candidate '{$companyName}' deleted.");
    }

    /**
     * Update individual extracted candidate details.
     */
    public function updateCandidate(Request $request, LeadCollectionJob $job, LeadReviewCandidate $candidate)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'qualification_score' => 'nullable|integer|min:0|max:100',
            'service_opportunity' => 'nullable|string|max:255',
            'validation_status' => 'nullable|string|max:255',
            'review_category' => 'nullable|string|max:255',
        ]);

        $candidate->update($validated);

        LeadAutomationLog::create([
            'event_type' => 'candidate_updated',
            'title' => "Extracted Record Updated",
            'description' => "Candidate '{$candidate->company_name}' details updated for Job #{$job->job_number}.",
            'status' => 'info',
            'job_id' => $job->id,
        ]);

        return redirect()->back()->with('success', "Extracted candidate '{$candidate->company_name}' updated successfully.");
    }

    /**
     * Bulk delete extracted candidate records from job.
     */
    public function bulkDestroyCandidates(Request $request, LeadCollectionJob $job)
    {
        $validated = $request->validate([
            'candidate_ids' => 'required|array',
            'candidate_ids.*' => 'integer|exists:lead_review_candidates,id',
        ]);

        $count = count($validated['candidate_ids']);
        LeadReviewCandidate::whereIn('id', $validated['candidate_ids'])->delete();

        $newCount = max(0, $job->records_extracted - $count);
        $job->update(['records_extracted' => $newCount]);

        LeadAutomationLog::create([
            'event_type' => 'bulk_candidates_deleted',
            'title' => "Bulk Extracted Records Deleted",
            'description' => "Removed {$count} extracted candidate records from Job #{$job->job_number}.",
            'status' => 'warning',
            'job_id' => $job->id,
        ]);

        return redirect()->back()->with('success', "{$count} extracted candidate records deleted.");
    }

    /**
     * Re-run data pulling for an existing job.
     */
    public function run(LeadCollectionJob $job)
    {
        $this->discoveryService->executeJob($job);

        return redirect()->back()->with('success', "Extraction process re-executed for Job #{$job->job_number}.");
    }

    /**
     * Quick manual company URL analysis tool.
     */
    public function analyzeUrl(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|string|url',
        ]);

        $extracted = $this->extractor->extractFromUrl($validated['url']);
        $result = $this->pipelineRunner->processRecord($extracted, 'Manual URL Analysis');

        return redirect()->back()->with('success', "URL Analysis finished. Company '{$extracted['company_name']}' processed through pipeline.");
    }
}
