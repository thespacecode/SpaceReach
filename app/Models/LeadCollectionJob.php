<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadCollectionJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_number',
        'lead_source_id',
        'source_name',
        'target_industry',
        'target_location',
        'target_company_size',
        'target_service',
        'target_website_filter',
        'targeting_criteria',
        'status',
        'records_discovered',
        'records_extracted',
        'valid_leads',
        'duplicates_found',
        'errors_count',
        'started_at',
        'completed_at',
        'log_summary',
        'created_by',
    ];

    protected $casts = [
        'targeting_criteria' => 'array',
        'log_summary' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function source()
    {
        return $this->belongsTo(LeadSource::class, 'lead_source_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function candidates()
    {
        return $this->hasMany(LeadReviewCandidate::class, 'job_id')->orderBy('id', 'desc');
    }

    public function logs()
    {
        return $this->hasMany(LeadAutomationLog::class, 'job_id')->orderBy('id', 'desc');
    }
}
