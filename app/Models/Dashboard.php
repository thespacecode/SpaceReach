<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dashboard extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'is_default',
        'widgets',
    ];

    protected $casts = [
        'widgets' => 'array',
        'is_default' => 'boolean',
    ];

    /**
     * The user who owns this dashboard.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * All available widget definitions that can be added to a dashboard.
     */
    public static function availableWidgets(): array
    {
        return [
            ['key' => 'kpi_pipeline',             'label' => 'Total Pipeline Value',          'category' => 'KPI Card',     'size' => 'sm'],
            ['key' => 'kpi_revenue',              'label' => 'Closed Won Revenue',            'category' => 'KPI Card',     'size' => 'sm'],
            ['key' => 'kpi_deals',                'label' => 'Active Opportunities',          'category' => 'KPI Card',     'size' => 'sm'],
            ['key' => 'kpi_win_rate',             'label' => 'Sales Win Rate',                'category' => 'KPI Card',     'size' => 'sm'],
            ['key' => 'chart_area_opportunity',   'label' => 'Opportunity & Revenue Trend',   'category' => 'Area Chart',   'size' => 'lg'],
            ['key' => 'chart_bar_pipeline_stage', 'label' => 'Pipeline Value by Stage',       'category' => 'Bar Chart',    'size' => 'md'],
            ['key' => 'chart_bar_deals_company',  'label' => 'Top Deals by Company',          'category' => 'Horizontal Bar', 'size' => 'lg'],
            ['key' => 'chart_donut_lead_sources', 'label' => 'Lead Generation Channels',      'category' => 'Donut Chart',  'size' => 'md'],
            ['key' => 'table_recent_deals',       'label' => 'Recent Opportunities Table',    'category' => 'Data Table',   'size' => 'full'],
        ];
    }

    /**
     * Get all widget keys from this dashboard's config.
     */
    public function getWidgetKeys(): array
    {
        $widgets = $this->widgets ?? [];
        return array_map(fn($w) => is_array($w) ? ($w['type'] ?? $w['key'] ?? '') : $w, $widgets);
    }
}
