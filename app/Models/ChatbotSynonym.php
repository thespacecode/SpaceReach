<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ChatbotSynonym extends Model
{
    protected $fillable = ['word', 'synonyms'];
    protected function casts(): array { return ['synonyms' => 'array']; }
}
