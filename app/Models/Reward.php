<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reward extends Model
{
    protected $fillable = ['user_id', 'title', 'description', 'points', 'awarded_by', 'awarded_at'];
    protected function casts(): array { return ['awarded_at' => 'datetime']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function awarder(): BelongsTo { return $this->belongsTo(User::class, 'awarded_by'); }
}
