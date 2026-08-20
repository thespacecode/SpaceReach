<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Form extends Model
{
    protected $fillable = ['title', 'description', 'slug', 'fields', 'settings', 'status', 'created_by'];
    protected function casts(): array { return ['fields' => 'array', 'settings' => 'array']; }
    public function submissions(): HasMany { return $this->hasMany(FormSubmission::class); }
    public function integrations(): HasMany { return $this->hasMany(FormIntegration::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function getEmbedCodeAttribute(): string
    {
        $url = url("/forms/{$this->slug}/embed");
        return '<iframe src="' . $url . '" style="width:100%;min-height:500px;border:none;" loading="lazy"></iframe>';
    }
}
