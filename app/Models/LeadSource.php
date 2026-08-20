<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'status',
        'category',
        'last_synced_at',
        'records_fetched',
        'records_created',
        'duplicates_count',
        'errors_count',
        'reliability_score',
        'configuration',
        'description',
    ];

    protected $casts = [
        'configuration' => 'array',
        'last_synced_at' => 'datetime',
        'reliability_score' => 'float',
    ];

    public function jobs()
    {
        return $this->hasMany(LeadCollectionJob::class);
    }
}
