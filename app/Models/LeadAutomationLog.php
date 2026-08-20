<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadAutomationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_type',
        'title',
        'description',
        'status',
        'metadata',
        'job_id',
        'contact_id',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function job()
    {
        return $this->belongsTo(LeadCollectionJob::class, 'job_id');
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class, 'contact_id');
    }
}
