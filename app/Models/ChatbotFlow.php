<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ChatbotFlow extends Model
{
    protected $fillable = ['name', 'trigger_intent', 'trigger_keywords', 'steps', 'is_active', 'created_by'];
    protected function casts(): array { return ['trigger_keywords' => 'array', 'steps' => 'array', 'is_active' => 'boolean']; }
}
