<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatbotCategory extends Model
{
    protected $fillable = ['name', 'description', 'icon', 'order'];
    public function entries(): HasMany { return $this->hasMany(ChatbotEntry::class, 'category_id'); }
}
