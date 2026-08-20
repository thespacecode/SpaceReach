<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadReviewCandidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_number',
        'company_name',
        'first_name',
        'last_name',
        'email',
        'phone',
        'website',
        'industry',
        'location',
        'service_opportunity',
        'qualification_score',
        'review_category',
        'validation_status',
        'extracted_data',
        'enriched_data',
        'ai_inferences',
        'website_signals',
        'technology_stack',
        'provenance',
        'matched_lead_id',
        'duplicate_match_confidence',
        'source_id',
        'job_id',
        'status',
    ];

    protected $casts = [
        'extracted_data' => 'array',
        'enriched_data' => 'array',
        'ai_inferences' => 'array',
        'website_signals' => 'array',
        'technology_stack' => 'array',
        'provenance' => 'array',
    ];

    public function matchedLead()
    {
        return $this->belongsTo(Contact::class, 'matched_lead_id');
    }

    public function source()
    {
        return $this->belongsTo(LeadSource::class, 'source_id');
    }

    public function job()
    {
        return $this->belongsTo(LeadCollectionJob::class, 'job_id');
    }
}
