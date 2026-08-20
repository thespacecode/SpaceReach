<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    protected $fillable = ['name', 'days_allowed', 'is_paid', 'is_active'];
    protected function casts(): array { return ['is_paid' => 'boolean', 'is_active' => 'boolean']; }
}
