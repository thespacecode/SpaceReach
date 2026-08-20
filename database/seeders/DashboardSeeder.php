<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\ChatbotConversation;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\DealStage;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DashboardSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = User::first() ?? User::create([
            'name' => 'Super Admin',
            'email' => 'admin@thespacecode.com',
            'password' => bcrypt('Admin@123456'),
            'status' => 'active',
        ]);

        $users = User::pluck('id')->toArray();
        if (empty($users)) {
            $users = [$superadmin->id];
        }

        // Ensure default form
        $form = Form::first() ?? Form::create([
            'title' => 'Contact Us Form',
            'slug' => 'contact-us',
            'fields' => [['name' => 'full_name', 'type' => 'text'], ['name' => 'email', 'type' => 'email']],
            'status' => 'active',
            'created_by' => $superadmin->id,
        ]);

        $stages = DealStage::pluck('id')->toArray();
        if (empty($stages)) {
            $stages = [1, 2, 3, 4, 5, 6];
        }

        $sources = ['website', 'referral', 'manual', 'social', 'campaign', 'email'];
        $statuses = ['lead', 'customer', 'inactive'];
        $dealStatuses = ['open', 'won', 'lost'];
        $invoiceStatuses = ['paid', 'sent', 'overdue', 'draft'];
        $firstNames = ['Rahul', 'Priya', 'Amit', 'Neha', 'Vikas', 'Ananya', 'Rohan', 'Sneha', 'Karan', 'Pooja', 'Arjun', 'Divya', 'Siddharth', 'Kavya', 'Aditya', 'Isha', 'Rajesh', 'Meera', 'Manish', 'Simran'];
        $lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Verma', 'Gupta', 'Joshi', 'Mehta', 'Nair', 'Reddy', 'Rao', 'Chawla', 'Agarwal', 'Bhasin', 'Deshmukh', 'Kapoor', 'Malhotra', 'Bhatia', 'Saxena', 'Iyer'];
        $companies = ['Acme Corp', 'TechStart Inc', 'Globex Solutions', 'Initech', 'Umbrella Corp', 'Stark Industries', 'Wayne Enterprises', 'Cyberdyne Systems', 'Hooli', 'Pied Piper', 'Massive Dynamic', 'Aperture Labs'];

        // 1. Seed 500 Contacts
        $contactIds = [];
        for ($i = 1; $i <= 500; $i++) {
            $fn = $firstNames[array_rand($firstNames)];
            $ln = $lastNames[array_rand($lastNames)];
            $createdAt = Carbon::now()->subDays(rand(0, 365))->subHours(rand(0, 23));

            $c = Contact::create([
                'first_name' => $fn,
                'last_name' => $ln,
                'email' => strtolower($fn . '.' . $ln . $i . '@example.com'),
                'phone' => '+91-' . rand(7000000000, 9999999999),
                'company' => $companies[array_rand($companies)],
                'job_title' => ['Manager', 'Director', 'Lead', 'VP', 'Executive', 'Analyst'][rand(0, 5)],
                'source' => $sources[array_rand($sources)],
                'status' => $statuses[array_rand($statuses)],
                'assigned_to' => $users[array_rand($users)],
                'created_by' => $superadmin->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
            $contactIds[] = $c->id;
        }

        // 2. Seed 500 Deals
        $dealTitles = [
            'Enterprise License', 'Website Redesign', 'Mobile App Development', 'Cloud Migration',
            'Annual Support Contract', 'UI/UX Audit', 'Custom CRM Integration', 'DevOps Automation',
            'SEO & Marketing Package', 'Security Audit', 'API Infrastructure Upgrade', 'SaaS Implementation'
        ];

        for ($i = 1; $i <= 500; $i++) {
            $createdAt = Carbon::now()->subDays(rand(0, 365))->subHours(rand(0, 23));
            $st = $dealStatuses[array_rand($dealStatuses)];
            $val = rand(25, 250) * 10000; // 250,000 to 2,500,000 INR

            Deal::create([
                'title' => $dealTitles[array_rand($dealTitles)] . ' #' . $i,
                'contact_id' => $contactIds[array_rand($contactIds)],
                'value' => $val,
                'currency' => 'INR',
                'stage_id' => $stages[array_rand($stages)],
                'pipeline_id' => 1,
                'assigned_to' => $users[array_rand($users)],
                'expected_close' => Carbon::now()->addDays(rand(-60, 180)),
                'closed_at' => $st !== 'open' ? $createdAt : null,
                'status' => $st,
                'probability' => $st === 'won' ? 100 : ($st === 'lost' ? 0 : rand(20, 80)),
                'description' => 'Seeded enterprise deal for analytics tracking.',
                'created_by' => $superadmin->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        // 3. Seed 500 Invoices & Payments
        for ($i = 1; $i <= 500; $i++) {
            $createdAt = Carbon::now()->subDays(rand(0, 365))->subHours(rand(0, 23));
            $st = $invoiceStatuses[array_rand($invoiceStatuses)];
            $subtotal = rand(15, 150) * 10000;
            $tax = $subtotal * 0.18;
            $total = $subtotal + $tax;

            $inv = Invoice::create([
                'invoice_number' => 'INV-' . strtoupper(Str::random(4)) . '-' . rand(10000, 99999),
                'contact_id' => $contactIds[array_rand($contactIds)],
                'items' => [['name' => 'Enterprise Service & License', 'quantity' => 1, 'rate' => $subtotal, 'amount' => $subtotal]],
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => 0,
                'total' => $total,
                'status' => $st,
                'issue_date' => $createdAt->toDateString(),
                'due_date' => $createdAt->copy()->addDays(30)->toDateString(),
                'paid_at' => $st === 'paid' ? $createdAt->copy()->addDays(rand(1, 15)) : null,
                'notes' => 'Thank you for your business.',
                'created_by' => $superadmin->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            if ($st === 'paid') {
                Payment::create([
                    'invoice_id' => $inv->id,
                    'amount' => $total,
                    'method' => ['bank_transfer', 'upi', 'credit_card', 'stripe'][rand(0, 3)],
                    'transaction_id' => 'TXN-' . (30000 + $i),
                    'status' => 'completed',
                    'paid_at' => $inv->paid_at,
                    'recorded_by' => $superadmin->id,
                    'created_at' => $inv->paid_at,
                ]);
            }
        }

        // 4. Seed 500 Form Submissions
        for ($i = 1; $i <= 500; $i++) {
            $submittedAt = Carbon::now()->subDays(rand(0, 90))->subMinutes(rand(0, 1440));
            FormSubmission::create([
                'form_id' => $form->id,
                'data' => [
                    'full_name' => $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)],
                    'email' => 'submission' . $i . '@example.com',
                    'message' => 'Interested in enterprise software consultation.',
                ],
                'ip_address' => '192.168.1.' . rand(1, 254),
                'user_agent' => 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36',
                'referrer' => 'https://google.com',
                'is_read' => (bool) rand(0, 1),
                'submitted_at' => $submittedAt,
                'created_at' => $submittedAt,
                'updated_at' => $submittedAt,
            ]);
        }

        // 5. Seed 500 Chatbot Conversations
        for ($i = 1; $i <= 500; $i++) {
            $startedAt = Carbon::now()->subDays(rand(0, 30))->subMinutes(rand(0, 1440));
            ChatbotConversation::create([
                'session_id' => (string) Str::uuid(),
                'visitor_name' => $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)],
                'visitor_email' => 'visitor' . $i . '@example.com',
                'visitor_ip' => '192.168.1.' . rand(1, 254),
                'status' => ['active', 'ended', 'escalated'][rand(0, 2)],
                'satisfaction_rating' => rand(3, 5),
                'started_at' => $startedAt,
                'ended_at' => $startedAt->copy()->addMinutes(rand(3, 20)),
                'created_at' => $startedAt,
            ]);
        }

        // 6. Seed 500 Audit Logs
        $actions = ['created Contact', 'updated Deal', 'approved Invoice', 'generated Quote', 'exported Contacts', 'deleted FormSubmission', 'modified Settings'];
        $modelTypes = ['App\\Models\\Contact', 'App\\Models\\Deal', 'App\\Models\\Invoice', 'App\\Models\\Quote', 'App\\Models\\User'];

        for ($i = 1; $i <= 500; $i++) {
            $createdAt = Carbon::now()->subDays(rand(0, 60))->subMinutes(rand(0, 1440));
            AuditLog::create([
                'user_id' => $users[array_rand($users)],
                'action' => $actions[array_rand($actions)],
                'model_type' => $modelTypes[array_rand($modelTypes)],
                'model_id' => rand(1, 500),
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 Macintosh',
                'created_at' => $createdAt,
            ]);
        }
    }
}
