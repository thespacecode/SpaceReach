<?php

namespace App\Services\LeadEngine;

use App\Models\Contact;

class DeduplicationEngine
{
    /**
     * Compare incoming candidate record against existing Lead Sheet database records.
     * Uses website domain, email, phone, and company fuzzy matching.
     */
    public function checkDuplicate(array $candidate): array
    {
        $domain = $candidate['website'] ?? null;
        $email = strtolower(trim($candidate['email'] ?? ''));
        $phone = $candidate['phone'] ?? null;
        $company = strtolower(trim($candidate['company'] ?? $candidate['company_name'] ?? ''));

        // 1. Exact Email Match (100% confidence)
        if (!empty($email)) {
            $existing = Contact::where('email', $email)->first();
            if ($existing) {
                return [
                    'is_duplicate' => true,
                    'confidence' => 100,
                    'matched_lead' => $existing,
                    'match_reason' => 'Exact email address match: ' . $email,
                ];
            }
        }

        // 2. Domain Match (95% confidence)
        if (!empty($domain)) {
            $cleanDomain = parse_url($domain, PHP_URL_HOST) ?? $domain;
            $existing = Contact::where('custom_fields->website', 'like', "%{$cleanDomain}%")->first();
            if ($existing) {
                return [
                    'is_duplicate' => true,
                    'confidence' => 95,
                    'matched_lead' => $existing,
                    'match_reason' => 'Canonical website domain match: ' . $cleanDomain,
                ];
            }
        }

        // 3. Exact Phone Match (90% confidence)
        if (!empty($phone) && strlen($phone) > 6) {
            $cleanPhone = preg_replace('/[^\d]/', '', $phone);
            $existing = Contact::where('phone', 'like', "%{$cleanPhone}%")->first();
            if ($existing) {
                return [
                    'is_duplicate' => true,
                    'confidence' => 90,
                    'matched_lead' => $existing,
                    'match_reason' => 'Phone number match: ' . $phone,
                ];
            }
        }

        // 4. Fuzzy Company Name Match (85% confidence)
        if (!empty($company) && strlen($company) > 3) {
            $existing = Contact::where('company', 'like', "%{$company}%")->first();
            if ($existing) {
                return [
                    'is_duplicate' => true,
                    'confidence' => 85,
                    'matched_lead' => $existing,
                    'match_reason' => 'Fuzzy company name match: ' . $existing->company,
                ];
            }
        }

        return [
            'is_duplicate' => false,
            'confidence' => 0,
            'matched_lead' => null,
            'match_reason' => 'No duplicate record found',
        ];
    }
}
