<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    protected $fillable = ['user_id', 'leave_type_id', 'start_date', 'end_date', 'reason', 'status', 'approved_by', 'rejection_reason'];
    protected function casts(): array { return ['start_date' => 'date', 'end_date' => 'date']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function leaveType(): BelongsTo { return $this->belongsTo(LeaveType::class); }
    public function approver(): BelongsTo { return $this->belongsTo(User::class, 'approved_by'); }
    public function getDaysAttribute(): int { return $this->start_date->diffInDays($this->end_date) + 1; }
}
