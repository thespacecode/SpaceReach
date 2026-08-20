<?php

namespace App\Services\LeadEngine;

class NormalizationService
{
    /**
     * Normalize Phone Number to canonical format.
     */
    public function normalizePhone(?string $phone): ?string
    {
        if (!$phone) return null;
        // Clean digits
        $digits = preg_replace('/[^\d+]/', '', $phone);
        if (empty($digits)) return null;

        if (str_starts_with($digits, '+')) {
            return $digits;
        }

        if (strlen($digits) === 10) {
            return '+91 ' . substr($digits, 0, 5) . ' ' . substr($digits, 5);
        }

        return $phone;
    }

    /**
     * Normalize Website URL to canonical domain root format.
     */
    public function normalizeWebsite(?string $url): ?string
    {
        if (!$url) return null;

        $url = trim($url);
        if (!preg_match('~^https?://~i', $url)) {
            $url = 'https://' . $url;
        }

        $parsed = parse_url($url);
        if (!$parsed || !isset($parsed['host'])) {
            return null;
        }

        $host = strtolower($parsed['host']);
        $host = preg_replace('/^www\./', '', $host);

        return 'https://' . $host;
    }

    /**
     * Normalize Company Name (clean legal suffixes for matching while preserving clean name).
     */
    public function normalizeCompanyName(?string $name): ?string
    {
        if (!$name) return null;
        $clean = trim($name);
        // Replace redundant legal suffixes for normalized matching
        $clean = preg_replace('/\s+(Pvt\.?\s*Ltd\.?|Private\s+Limited|Inc\.?|LLC|Corp\.?|Corporation|Ltd\.?)$/i', '', $clean);
        return trim($clean);
    }

    /**
     * Normalize Location into structured format.
     */
    public function normalizeLocation(?string $location): array
    {
        if (!$location) {
            return ['city' => 'Bhubaneswar', 'state' => 'Odisha', 'country' => 'India'];
        }

        $parts = array_map('trim', explode(',', $location));
        $city = $parts[0] ?? 'Bhubaneswar';
        $state = $parts[1] ?? 'Odisha';
        $country = $parts[2] ?? 'India';

        return [
            'city' => $city,
            'state' => $state,
            'country' => $country,
        ];
    }
}
