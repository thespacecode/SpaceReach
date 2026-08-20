<?php

namespace Database\Seeders;

use App\Models\ChatbotCategory;
use App\Models\ChatbotEntry;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Department;
use App\Models\Pipeline;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    protected array $adminData;

    public function __construct(array $adminData = [])
    {
        $this->adminData = $adminData;
    }

    public function run(): void
    {
        // 1. Run Core Seeder first
        $this->callWith(CoreSeeder::class, ['adminData' => $this->adminData]);

        $superadminUser = User::role('superadmin')->first();

        // 2. Demo Users & Management Structure
        $sales = Department::where('name', 'Sales')->first();

        $demoManager = User::firstOrCreate(
            ['email' => 'rahul@thespacecode.com'],
            [
                'name' => 'Rahul Sharma',
                'password' => bcrypt('Manager@123'),
                'department_id' => $sales?->id,
                'designation_id' => 5,
                'reporting_to' => $superadminUser?->id,
                'status' => 'active',
            ]
        );
        $demoManager->assignRole('manager');

        $demoEmployee = User::firstOrCreate(
            ['email' => 'priya@thespacecode.com'],
            [
                'name' => 'Priya Patel',
                'password' => bcrypt('Employee@123'),
                'department_id' => $sales?->id,
                'designation_id' => 5,
                'reporting_to' => $demoManager->id,
                'status' => 'active',
            ]
        );
        $demoEmployee->assignRole('employee');

        // 3. Demo Contacts
        $pipeline = Pipeline::where('is_default', true)->first();

        $contacts = [
            ['first_name' => 'Amit', 'last_name' => 'Kumar', 'email' => 'amit@acmecorp.com', 'phone' => '+91-9876543210', 'company' => 'Acme Corp', 'source' => 'website', 'status' => 'lead', 'assigned_to' => $demoEmployee->id],
            ['first_name' => 'Sarah', 'last_name' => 'Johnson', 'email' => 'sarah@techstart.io', 'phone' => '+1-555-0123', 'company' => 'TechStart Inc', 'source' => 'referral', 'status' => 'customer', 'assigned_to' => $demoEmployee->id],
            ['first_name' => 'David', 'last_name' => 'Chen', 'email' => 'david@globex.com', 'phone' => '+1-555-0456', 'company' => 'Globex Solutions', 'source' => 'manual', 'status' => 'lead', 'assigned_to' => $demoManager->id],
        ];
        foreach ($contacts as $c) {
            $c['created_by'] = $superadminUser?->id;
            Contact::firstOrCreate(['email' => $c['email']], $c);
        }

        // 4. Demo Deals
        if ($pipeline) {
            Deal::firstOrCreate(
                ['title' => 'Acme Website Redesign'],
                ['contact_id' => 1, 'value' => 250000, 'currency' => 'INR', 'stage_id' => 3, 'pipeline_id' => $pipeline->id, 'assigned_to' => $demoEmployee->id, 'status' => 'open', 'probability' => 60, 'expected_close' => now()->addDays(30), 'created_by' => $superadminUser?->id]
            );
            Deal::firstOrCreate(
                ['title' => 'TechStart Mobile App'],
                ['contact_id' => 2, 'value' => 500000, 'currency' => 'INR', 'stage_id' => 2, 'pipeline_id' => $pipeline->id, 'assigned_to' => $demoManager->id, 'status' => 'open', 'probability' => 40, 'expected_close' => now()->addDays(60), 'created_by' => $superadminUser?->id]
            );
        }

        // 5. Chatbot Entries
        $general = ChatbotCategory::where('name', 'General')->first();
        $services = ChatbotCategory::where('name', 'Services')->first();
        $pricing = ChatbotCategory::where('name', 'Pricing')->first();
        $support = ChatbotCategory::where('name', 'Support')->first();

        if ($general && $services && $pricing && $support) {
            $entries = [
                ['category_id' => $general->id, 'question' => 'What does SpaceReach do?', 'answer' => 'SpaceReach is an enterprise Prospecting & CRM portal designed for scalable sales automation, lead acquisition, and customer tracking.', 'keywords' => ['about', 'company', 'what', 'do', 'who'], 'intent' => 'about'],
                ['category_id' => $general->id, 'question' => 'Where is your office located?', 'answer' => 'We serve clients globally. You can reach us at contact@spacereach.com for more details.', 'keywords' => ['location', 'office', 'where', 'address', 'based'], 'intent' => 'location'],
                ['category_id' => $general->id, 'question' => 'How can I contact support?', 'answer' => 'You can reach our team at support@spacereach.com or through this portal chatbot.', 'keywords' => ['contact', 'reach', 'email', 'touch'], 'intent' => 'contact'],
                ['category_id' => $services->id, 'question' => 'What modules are available?', 'answer' => 'SpaceReach includes CRM, Lead Prospect Engine, Finance Invoicing, Employee OKRs & HR, Analytics Dashboard, and Custom Form Builder.', 'keywords' => ['services', 'offer', 'modules', 'features'], 'intent' => 'services'],
                ['category_id' => $pricing->id, 'question' => 'What are your pricing plans?', 'answer' => 'We offer flexible enterprise tiers tailored to your team size and lead processing needs.', 'keywords' => ['price', 'pricing', 'cost', 'rate', 'quote'], 'intent' => 'pricing'],
                ['category_id' => $support->id, 'question' => 'I need technical assistance', 'answer' => 'Please submit a ticket or reach out to support@spacereach.com with details of your query.', 'keywords' => ['support', 'help', 'issue', 'problem', 'bug'], 'intent' => 'support'],
            ];
            foreach ($entries as $e) {
                $e['is_active'] = true;
                $e['created_by'] = $superadminUser?->id;
                ChatbotEntry::firstOrCreate(['question' => $e['question']], $e);
            }
        }

        // 6. Seed Dashboard Demo Dataset (500 records)
        $this->call(DashboardSeeder::class);

        // 7. Seed Top 30 Companies Dataset
        $this->call(Top30CompaniesSeeder::class);
    }
}
