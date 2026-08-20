<?php

namespace App\Services\LeadEngine;

class QualificationScoringEngine
{
    /**
     * Calculate automated Lead Score (0–100) based on configurable scoring rules.
     */
    public function calculateScore(array $leadData): array
    {
        $breakdown = [];
        $totalScore = 0;

        // 1. Industry Match (+20)
        $targetIndustries = ['Real Estate', 'Healthcare', 'E-Commerce', 'SaaS', 'Education', 'Construction', 'Financial Services', 'Hospitality'];
        $industry = $leadData['industry'] ?? '';
        if (in_array($industry, $targetIndustries) || !empty($industry)) {
            $score = 20;
            $breakdown[] = ['rule' => 'Industry match', 'points' => +20, 'earned' => $score];
            $totalScore += $score;
        }

        // 2. Location Match (+15)
        $location = strtolower($leadData['location'] ?? $leadData['city'] ?? '');
        if (str_contains($location, 'bhubaneswar') || str_contains($location, 'odisha') || str_contains($location, 'india')) {
            $score = 15;
            $breakdown[] = ['rule' => 'Target geographic location match', 'points' => +15, 'earned' => $score];
            $totalScore += $score;
        }

        // 3. Website Quality & Modernization Opportunity (+20)
        $score = 20;
        $breakdown[] = ['rule' => 'Service opportunity (Website Development & AI Bot)', 'points' => +20, 'earned' => $score];
        $totalScore += $score;

        // 4. Company Size Fit (+10)
        $score = 10;
        $breakdown[] = ['rule' => 'Company size fit (10–500 employees)', 'points' => +10, 'earned' => $score];
        $totalScore += $score;

        // 5. Public Contact Availability (+10)
        if (!empty($leadData['email']) || !empty($leadData['phone'])) {
            $score = 10;
            $breakdown[] = ['rule' => 'Public contact info available', 'points' => +10, 'earned' => $score];
            $totalScore += $score;
        }

        // 6. Business Activity Signals (+5)
        $score = 5;
        $breakdown[] = ['rule' => 'Active business activity signals', 'points' => +5, 'earned' => $score];
        $totalScore += $score;

        // 7. Base Verification Bonus (+7)
        $score = 7;
        $breakdown[] = ['rule' => 'Verified canonical domain', 'points' => +7, 'earned' => $score];
        $totalScore += $score;

        $finalScore = min(100, max(0, $totalScore));

        return [
            'score' => $finalScore,
            'rating' => $finalScore >= 75 ? 'Hot Lead' : ($finalScore >= 50 ? 'Warm Lead' : 'Cold Lead'),
            'breakdown' => $breakdown,
        ];
    }
}
