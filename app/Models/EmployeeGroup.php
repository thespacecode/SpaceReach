<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EmployeeGroup extends Model
{
    protected $fillable = ['name', 'description', 'created_by'];
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function members(): BelongsToMany { return $this->belongsToMany(User::class, 'employee_group_members', 'group_id', 'user_id')->withTimestamps(); }
}
