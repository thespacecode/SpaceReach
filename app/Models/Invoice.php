<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    protected $fillable = ['invoice_number', 'contact_id', 'deal_id', 'items', 'subtotal', 'tax', 'discount', 'total', 'status', 'issue_date', 'due_date', 'paid_at', 'notes', 'terms', 'created_by'];
    protected function casts(): array { return ['items' => 'array', 'subtotal' => 'decimal:2', 'tax' => 'decimal:2', 'discount' => 'decimal:2', 'total' => 'decimal:2', 'issue_date' => 'date', 'due_date' => 'date', 'paid_at' => 'datetime']; }
    public function contact(): BelongsTo { return $this->belongsTo(Contact::class); }
    public function deal(): BelongsTo { return $this->belongsTo(Deal::class); }
    public function payments(): HasMany { return $this->hasMany(Payment::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function getPaidAmountAttribute(): float { return $this->payments()->where('status', 'completed')->sum('amount'); }
    public function getBalanceAttribute(): float { return $this->total - $this->paid_amount; }
}
