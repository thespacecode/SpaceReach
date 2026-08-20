<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormIntegration extends Model
{
    protected $fillable = ['form_id', 'type', 'config', 'is_active'];
    protected function casts(): array { return ['config' => 'array', 'is_active' => 'boolean']; }
    public function form(): BelongsTo { return $this->belongsTo(Form::class); }
}
