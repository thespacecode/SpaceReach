<?php

namespace App\Services\LeadEngine;

class ValidationService
{
    /**
     * Validate candidate lead record against data quality rules.
     */
    public function validateLead(array $data): array
    {
        $issues = [];
        $status = 'Valid';

        if (empty($data['company_name']) && empty($data['first_name'])) {
            $issues[] = 'Missing company name and contact name';
            $status = 'Invalid';
        }

        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $issues[] = 'Invalid email syntax format';
            if ($status !== 'Invalid') $status = 'Needs Review';
        }

        if (empty($data['email']) && empty($data['phone'])) {
            $issues[] = 'Missing primary contact method (email and phone missing)';
            if ($status !== 'Invalid') $status = 'Incomplete';
        }

        if (empty($data['website'])) {
            $issues[] = 'Missing business website URL';
            if ($status === 'Valid') $status = 'Needs Review';
        }

        return [
            'status' => $status,
            'issues' => $issues,
            'is_valid' => $status === 'Valid',
        ];
    }
}
