<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Quote;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\ChatbotConversation;
use App\Models\ChatbotEntry;
use App\Models\AuditLog;
use App\Models\Department;

class GlobalSearchController extends Controller
{
    /**
     * Perform global search across all portal data.
     */
    public function search(Request $request)
    {
        $q = trim($request->input('q', ''));

        if (strlen($q) < 1) {
            return response()->json(['results' => [], 'query' => $q]);
        }

        $results = [];

        // 1. Navigation / Static System Pages
        $staticPages = [
            ['title' => 'Dashboard Overview', 'subtitle' => 'Track live performance metrics and charts', 'category' => 'Navigation', 'url' => '/dashboard', 'icon' => 'LayoutDashboard'],
            ['title' => 'Contacts Directory', 'subtitle' => 'View and manage CRM contacts', 'category' => 'Navigation', 'url' => '/contacts', 'icon' => 'Contact'],
            ['title' => 'Opportunity Pipeline', 'subtitle' => 'Manage sales pipeline and opportunities', 'category' => 'Navigation', 'url' => '/opportunity', 'icon' => 'HandCoins'],
            ['title' => 'Proposals Management', 'subtitle' => 'Generate and review sales proposals', 'category' => 'Navigation', 'url' => '/proposals', 'icon' => 'FileText'],
            ['title' => 'Invoices Management', 'subtitle' => 'Track paid and pending invoices', 'category' => 'Navigation', 'url' => '/finance/invoices', 'icon' => 'Receipt'],
            ['title' => 'Payments Log', 'subtitle' => 'Review transaction payment records', 'category' => 'Navigation', 'url' => '/finance/payments', 'icon' => 'DollarSign'],
            ['title' => 'Employees Directory', 'subtitle' => 'Manage team members and staff', 'category' => 'Navigation', 'url' => '/employees', 'icon' => 'Users'],
            ['title' => 'Leave Requests', 'subtitle' => 'Approve or apply for employee leaves', 'category' => 'Navigation', 'url' => '/employees/leaves', 'icon' => 'Calendar'],
            ['title' => 'Forms & Surveys', 'subtitle' => 'Manage lead forms and submissions', 'category' => 'Navigation', 'url' => '/forms', 'icon' => 'ClipboardList'],
            ['title' => 'AI Chatbot Knowledge Base', 'subtitle' => 'Configure chatbot Q&A and flows', 'category' => 'Navigation', 'url' => '/ai-chatbot', 'icon' => 'Bot'],
            ['title' => 'Analytics & Reports', 'subtitle' => 'Deep dive into revenue analytics', 'category' => 'Navigation', 'url' => '/analytics', 'icon' => 'BarChart3'],
            ['title' => 'System Settings', 'subtitle' => 'Localization, timezone, and portal preferences', 'category' => 'Navigation', 'url' => '/settings', 'icon' => 'Settings'],
            ['title' => 'Audit & System Logs', 'subtitle' => 'Review security and user audit logs', 'category' => 'Navigation', 'url' => '/settings?tab=audit', 'icon' => 'ShieldAlert'],
        ];

        foreach ($staticPages as $page) {
            if (stripos($page['title'], $q) !== false || stripos($page['subtitle'], $q) !== false || stripos($page['category'], $q) !== false) {
                $results[] = [
                    'id' => 'page-' . md5($page['url']),
                    'title' => $page['title'],
                    'subtitle' => $page['subtitle'],
                    'category' => 'Page',
                    'url' => $page['url'],
                    'type' => 'navigation',
                ];
            }
        }

        // 2. Contacts
        $contacts = Contact::where('first_name', 'like', "%{$q}%")
            ->orWhere('last_name', 'like', "%{$q}%")
            ->orWhere('email', 'like', "%{$q}%")
            ->orWhere('company', 'like', "%{$q}%")
            ->orWhere('phone', 'like', "%{$q}%")
            ->orWhere('job_title', 'like', "%{$q}%")
            ->limit(5)
            ->get();

        foreach ($contacts as $c) {
            $name = trim("{$c->first_name} {$c->last_name}");
            $sub = array_filter([$c->job_title, $c->company, $c->email]);
            $results[] = [
                'id' => 'contact-' . $c->id,
                'title' => $name ?: 'Unnamed Contact',
                'subtitle' => implode(' • ', $sub) ?: 'CRM Contact',
                'category' => 'Contact',
                'url' => '/contacts',
                'type' => 'contact',
            ];
        }

        // 3. Deals
        $deals = Deal::where('title', 'like', "%{$q}%")
            ->orWhere('stage', 'like', "%{$q}%")
            ->limit(5)
            ->get();

        foreach ($deals as $d) {
            $val = $d->value ? '₹' . number_format($d->value) : '';
            $sub = array_filter([$d->stage ? ucfirst($d->stage) : null, $val]);
            $results[] = [
                'id' => 'deal-' . $d->id,
                'title' => $d->title ?: 'Deal #' . $d->id,
                'subtitle' => implode(' • ', $sub) ?: 'Sales Opportunity',
                'category' => 'Opportunity',
                'url' => '/opportunity',
                'type' => 'deal',
            ];
        }

        // 4. Invoices
        $invoices = Invoice::where('invoice_number', 'like', "%{$q}%")
            ->orWhere('client_name', 'like', "%{$q}%")
            ->orWhere('status', 'like', "%{$q}%")
            ->limit(5)
            ->get();

        foreach ($invoices as $inv) {
            $val = $inv->total_amount ? '₹' . number_format($inv->total_amount) : '';
            $sub = array_filter([$inv->invoice_number, $inv->status ? ucfirst($inv->status) : null, $val]);
            $results[] = [
                'id' => 'invoice-' . $inv->id,
                'title' => $inv->client_name ? "Invoice for {$inv->client_name}" : ($inv->invoice_number ?: 'Invoice #' . $inv->id),
                'subtitle' => implode(' • ', $sub) ?: 'Finance Invoice',
                'category' => 'Invoice',
                'url' => '/finance/invoices',
                'type' => 'invoice',
            ];
        }

        // 5. Quotes
        $quotes = Quote::where('quote_number', 'like', "%{$q}%")
            ->orWhere('title', 'like', "%{$q}%")
            ->limit(5)
            ->get();

        foreach ($quotes as $qt) {
            $results[] = [
                'id' => 'quote-' . $qt->id,
                'title' => $qt->title ?: ($qt->quote_number ?: 'Proposal #' . $qt->id),
                'subtitle' => "Proposal #" . ($qt->quote_number ?? $qt->id),
                'category' => 'Proposal',
                'url' => '/proposals',
                'type' => 'quote',
            ];
        }

        // 6. Employees / Users
        $users = User::where('name', 'like', "%{$q}%")
            ->orWhere('email', 'like', "%{$q}%")
            ->limit(5)
            ->get();

        foreach ($users as $u) {
            $results[] = [
                'id' => 'user-' . $u->id,
                'title' => $u->name,
                'subtitle' => $u->email,
                'category' => 'User',
                'url' => '/employees',
                'type' => 'user',
            ];
        }

        // 7. Forms
        $forms = Form::where('title', 'like', "%{$q}%")
            ->orWhere('name', 'like', "%{$q}%")
            ->limit(5)
            ->get();

        foreach ($forms as $f) {
            $results[] = [
                'id' => 'form-' . $f->id,
                'title' => $f->title ?: $f->name,
                'subtitle' => 'Form Template',
                'category' => 'Form',
                'url' => '/forms',
                'type' => 'form',
            ];
        }

        // 8. Chatbot Q&A
        $chatEntries = ChatbotEntry::where('question', 'like', "%{$q}%")
            ->orWhere('answer', 'like', "%{$q}%")
            ->limit(5)
            ->get();

        foreach ($chatEntries as $e) {
            $results[] = [
                'id' => 'chat-' . $e->id,
                'title' => $e->question,
                'subtitle' => 'Chatbot Knowledge Base Entry',
                'category' => 'AI Chatbot',
                'url' => '/ai-chatbot',
                'type' => 'chatbot',
            ];
        }

        // 9. Audit Logs
        $logs = AuditLog::where('action', 'like', "%{$q}%")
            ->orWhere('user_name', 'like', "%{$q}%")
            ->orWhere('entity_type', 'like', "%{$q}%")
            ->limit(5)
            ->get();

        foreach ($logs as $l) {
            $results[] = [
                'id' => 'log-' . $l->id,
                'title' => "Audit: {$l->action}",
                'subtitle' => "by {$l->user_name} • {$l->entity_type}",
                'category' => 'Audit Log',
                'url' => '/admin/audit',
                'type' => 'log',
            ];
        }

        return response()->json([
            'results' => $results,
            'query' => $q,
            'count' => count($results)
        ]);
    }
}
