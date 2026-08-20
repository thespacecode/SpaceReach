<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pipeline extends Model
{
    protected $fillable = ['name', 'is_default'];
    protected function casts(): array { return ['is_default' => 'boolean']; }
    public function stages(): HasMany { return $this->hasMany(DealStage::class); }
    public function deals(): HasMany { return $this->hasMany(Deal::class); }
}
