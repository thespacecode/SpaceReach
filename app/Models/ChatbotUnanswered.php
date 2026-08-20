<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ChatbotUnanswered extends Model
{
    protected $table = 'chatbot_unanswered';
    protected $fillable = ['question', 'occurrence_count', 'last_asked_at', 'status', 'resolved_entry_id'];
    protected function casts(): array { return ['last_asked_at' => 'datetime']; }
}
