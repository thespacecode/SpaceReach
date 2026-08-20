<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatbotMessage extends Model
{
    public $timestamps = false;
    protected $fillable = ['conversation_id', 'role', 'message', 'matched_entry_id', 'confidence_score', 'created_at'];
    protected function casts(): array { return ['confidence_score' => 'decimal:4', 'created_at' => 'datetime']; }
    public function conversation(): BelongsTo { return $this->belongsTo(ChatbotConversation::class, 'conversation_id'); }
    public function matchedEntry(): BelongsTo { return $this->belongsTo(ChatbotEntry::class, 'matched_entry_id'); }
}
