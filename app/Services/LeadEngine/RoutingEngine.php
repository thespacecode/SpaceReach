<?php

namespace App\Services\LeadEngine;

use App\Models\LeadRoutingRule;
use App\Models\User;

class RoutingEngine
{
    /**
     * Evaluate incoming lead details against active routing rules.
     */
    public function routeLead(array $leadData, int $score): array
    {
        $service = $leadData['service_opportunity'] ?? $leadData['service_requested'] ?? '';
        $location = $leadData['location'] ?? '';

        $rules = LeadRoutingRule::where('is_active', true)->orderBy('priority_order', 'asc')->get();

        foreach ($rules as $rule) {
            $serviceMatch = empty($rule->service_type) || strcasecmp($rule->service_type, $service) === 0;
            $scoreMatch = $score >= $rule->min_lead_score;
            $locationMatch = empty($rule->location_filter) || str_contains(strtolower($location), strtolower($rule->location_filter));

            if ($serviceMatch && $scoreMatch && $locationMatch) {
                return [
                    'assigned_to' => $rule->assign_to_user_id,
                    'priority' => $rule->set_priority,
                    'rule_name' => $rule->name,
                ];
            }
        }

        // Fallback default routing logic
        $defaultUser = User::where('status', 'active')->first();
        return [
            'assigned_to' => $defaultUser ? $defaultUser->id : null,
            'priority' => $score >= 75 ? 'high' : 'medium',
            'rule_name' => 'Default Automatic Routing',
        ];
    }
}
