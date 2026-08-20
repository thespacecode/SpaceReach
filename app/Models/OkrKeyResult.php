<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OkrKeyResult extends Model
{
    protected $fillable = ['okr_id', 'title', 'target_value', 'current_value', 'unit'];
    protected function casts(): array { return ['target_value' => 'decimal:2', 'current_value' => 'decimal:2']; }
    public function okr(): BelongsTo { return $this->belongsTo(Okr::class); }
    public function getProgressAttribute(): float { return $this->target_value > 0 ? round(($this->current_value / $this->target_value) * 100, 1) : 0; }
}
