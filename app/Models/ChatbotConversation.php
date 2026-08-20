<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatbotConversation extends Model
{
    protected $fillable = ['session_id', 'visitor_name', 'visitor_email', 'visitor_ip', 'started_at', 'ended_at', 'status', 'converted_contact_id', 'satisfaction_rating'];
    protected function casts(): array { return ['started_at' => 'datetime', 'ended_at' => 'datetime']; }
    public function messages(): HasMany { return $this->hasMany(ChatbotMessage::class, 'conversation_id'); }
    public function convertedContact() { return $this->belongsTo(Contact::class, 'converted_contact_id'); }
}
