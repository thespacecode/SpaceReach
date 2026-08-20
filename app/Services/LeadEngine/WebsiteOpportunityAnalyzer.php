<?php

namespace App\Services\LeadEngine;

class WebsiteOpportunityAnalyzer
{
    /**
     * Analyze website signals and identify legitimate service opportunity signals for TheSpaceCode.
     */
    public function analyzeOpportunity(string $domain, array $techStack, array $extracted): array
    {
        $opportunities = [];
        $recommendedServices = [];

        $hasAnalytics = false;
        $isWordpress = false;

        foreach ($techStack as $tech) {
            if ($tech['name'] === 'WordPress') $isWordpress = true;
            if ($tech['name'] === 'Google Analytics (GA4)') $hasAnalytics = true;
        }

        // 1. Web Development Opportunity Signals
        if ($isWordpress) {
            $opportunities[] = [
                'type' => 'website_revamp',
                'title' => 'Monolithic WordPress CMS',
                'description' => 'Potential opportunity: website built on legacy WordPress plugin ecosystem; potential speed & custom UX upgrade opportunity to modern Next.js/React stack.',
                'confidence' => 'High',
                'service' => 'Website Development'
            ];
            $recommendedServices[] = 'Website Development';
        }

        if (!$hasAnalytics) {
            $opportunities[] = [
                'type' => 'analytics_gap',
                'title' => 'Missing Google Analytics 4',
                'description' => 'Potential opportunity: website appears to lack public GA4 telemetry tracking scripts.',
                'confidence' => 'Medium',
                'service' => 'Digital Marketing'
            ];
            $recommendedServices[] = 'Digital Marketing';
        }

        // 2. Mobile Experience Gaps
        $opportunities[] = [
            'type' => 'mobile_optimization',
            'title' => 'Mobile UX & Conversion Optimization',
            'description' => 'Potential opportunity: landing page CTA hierarchy and mobile viewport load speed can be optimized for higher lead conversion.',
            'confidence' => 'Medium',
            'service' => 'Website Development'
        ];
        $recommendedServices[] = 'Website Development';

        // 3. AI Automation Opportunity
        $opportunities[] = [
            'type' => 'ai_automation',
            'title' => '24/7 Lead Capture Bot Gap',
            'description' => 'Potential opportunity: no active website chat/lead capture widget detected on public homepage.',
            'confidence' => 'High',
            'service' => 'AI Automation'
        ];
        $recommendedServices[] = 'AI Automation';

        return [
            'has_website' => !empty($domain),
            'opportunity_score' => 85,
            'primary_service' => $recommendedServices[0] ?? 'Website Development',
            'recommended_services' => array_unique($recommendedServices),
            'opportunity_signals' => $opportunities,
        ];
    }
}
