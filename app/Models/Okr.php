<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Okr extends Model
{
    protected $fillable = ['user_id', 'title', 'description', 'period_start', 'period_end', 'status', 'progress'];
    protected function casts(): array { return ['period_start' => 'date', 'period_end' => 'date']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function keyResults(): HasMany { return $this->hasMany(OkrKeyResult::class); }
    public function calculateProgress(): int { $krs = $this->keyResults; if ($krs->isEmpty()) return 0; return (int) $krs->avg(fn($kr) => $kr->target_value > 0 ? ($kr->current_value / $kr->target_value) * 100 : 0); }
}
