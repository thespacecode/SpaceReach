<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormSubmission extends Model
{
    protected $fillable = ['form_id', 'data', 'ip_address', 'user_agent', 'referrer', 'is_read', 'converted_contact_id', 'submitted_at'];
    protected function casts(): array { return ['data' => 'array', 'is_read' => 'boolean', 'submitted_at' => 'datetime']; }
    public function form(): BelongsTo { return $this->belongsTo(Form::class); }
    public function convertedContact(): BelongsTo { return $this->belongsTo(Contact::class, 'converted_contact_id'); }
}
