<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatbotEntry extends Model
{
    protected $fillable = ['category_id', 'question', 'answer', 'keywords', 'intent', 'priority', 'is_active', 'created_by'];
    protected function casts(): array { return ['keywords' => 'array', 'is_active' => 'boolean']; }
    public function category(): BelongsTo { return $this->belongsTo(ChatbotCategory::class, 'category_id'); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
