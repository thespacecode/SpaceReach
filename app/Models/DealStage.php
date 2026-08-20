<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealStage extends Model
{
    protected $fillable = ['pipeline_id', 'name', 'order', 'color'];
    public function pipeline(): BelongsTo { return $this->belongsTo(Pipeline::class); }
}
