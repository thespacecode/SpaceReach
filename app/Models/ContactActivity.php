<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactActivity extends Model
{
    protected $fillable = ['contact_id', 'user_id', 'type', 'title', 'description', 'scheduled_at', 'completed_at'];
    protected function casts(): array { return ['scheduled_at' => 'datetime', 'completed_at' => 'datetime']; }
    public function contact(): BelongsTo { return $this->belongsTo(Contact::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
