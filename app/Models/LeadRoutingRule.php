<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadRoutingRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'service_type',
        'min_lead_score',
        'location_filter',
        'assign_to_user_id',
        'set_priority',
        'is_active',
        'priority_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assign_to_user_id');
    }
}
