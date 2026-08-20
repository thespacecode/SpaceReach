<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quote extends Model
{
    protected $fillable = ['quote_number', 'deal_id', 'contact_id', 'items', 'subtotal', 'tax', 'discount', 'total', 'status', 'valid_until', 'notes', 'terms', 'created_by'];
    protected function casts(): array { return ['items' => 'array', 'subtotal' => 'decimal:2', 'tax' => 'decimal:2', 'discount' => 'decimal:2', 'total' => 'decimal:2', 'valid_until' => 'date']; }
    public function deal(): BelongsTo { return $this->belongsTo(Deal::class); }
    public function contact(): BelongsTo { return $this->belongsTo(Contact::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
