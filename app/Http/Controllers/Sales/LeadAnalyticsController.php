<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\LeadAutomationLog;
use App\Models\LeadReviewCandidate;
use App\Models\LeadSource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadAnalyticsController extends Controller
{
    /**
     * Display Data Quality Overview & Source Performance Analytics (Sales → Data Quality & Analytics).
     */
    public function index()
    {
        $allLeads = Contact::all();
        $reviewCandidates = LeadReviewCandidate::all();
        $sources = LeadSource::all();
        $logs = LeadAutomationLog::with('job', 'contact')
            ->orderBy('id', 'desc')
            ->take(20)
            ->get();

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

        return Inertia::render('Sales/Leads/Analytics', [
            'qualityMetrics' => $qualityMetrics,
            'sourcePerformance' => $sourcePerformance,
            'logs' => $logs,
            'sources' => $sources,
        ]);
    }
}
