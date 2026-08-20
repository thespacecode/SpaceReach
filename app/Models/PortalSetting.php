<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortalSetting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'group'];

    public static function get(string $key, $default = null)
    {
        try {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        } catch (\Throwable $e) {
            return $default;
        }
    }

    public static function set(string $key, $value, string $type = 'text', string $group = 'general'): void
    {
        try {
            static::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'type' => $type, 'group' => $group]
            );
        } catch (\Throwable $e) {
            // Ignore if setting table is unavailable
        }
    }

    public static function getAll(string $group = null): array
    {
        try {
            $query = static::query();
            if ($group) {
                $query->where('group', $group);
            }
            return $query->pluck('value', 'key')->toArray();
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Get the configured pagination size, fallback to 20.
     */
    public static function paginationSize(): int
    {
        return (int) (static::get('pagination_size', 20) ?: 20);
    }
}
