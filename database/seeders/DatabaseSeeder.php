<?php

namespace Database\Seeders;

use App\Models\ChatbotCategory;
use App\Models\ChatbotEntry;
use App\Models\ChatbotSetting;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\DealStage;
use App\Models\Department;
use App\Models\Designation;
use App\Models\LeaveType;
use App\Models\Pipeline;
use App\Models\PortalSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Portal Settings ──
        $settings = [
            ['key' => 'company_name', 'value' => 'TheSpaceCode', 'type' => 'text', 'group' => 'general'],
            ['key' => 'company_tagline', 'value' => 'Building the Future', 'type' => 'text', 'group' => 'general'],
            ['key' => 'primary_color', 'value' => '#1863B8', 'type' => 'color', 'group' => 'appearance'],
            ['key' => 'secondary_color', 'value' => '#002B5C', 'type' => 'color', 'group' => 'appearance'],
            ['key' => 'accent_color', 'value' => '#B4CFED', 'type' => 'color', 'group' => 'appearance'],
            ['key' => 'sidebar_color', 'value' => '#002B5C', 'type' => 'color', 'group' => 'appearance'],
            ['key' => 'font_family', 'value' => 'Inter', 'type' => 'text', 'group' => 'appearance'],
            ['key' => 'logo', 'value' => null, 'type' => 'image', 'group' => 'appearance'],
            ['key' => 'favicon', 'value' => null, 'type' => 'image', 'group' => 'appearance'],
            ['key' => 'timezone', 'value' => 'Asia/Kolkata', 'type' => 'text', 'group' => 'general'],
            ['key' => 'currency', 'value' => 'INR', 'type' => 'text', 'group' => 'general'],
            ['key' => 'date_format', 'value' => 'd M Y', 'type' => 'text', 'group' => 'general'],
            ['key' => 'enforce_2fa', 'value' => 'true', 'type' => 'boolean', 'group' => 'security'],
            ['key' => 'session_timeout', 'value' => '120', 'type' => 'text', 'group' => 'security'],
        ];
        foreach ($settings as $s) {
            PortalSetting::create($s);
        }

        // ── Permissions ──
        $modules = [
            'dashboard' => ['view'],
            'employees' => ['view', 'create', 'edit', 'delete'],
            'employees.groups' => ['view', 'create', 'edit', 'delete'],
            'employees.okr' => ['view', 'create', 'edit', 'delete'],
            'employees.reviews' => ['view', 'create', 'edit', 'delete'],
            'employees.leaves' => ['view', 'create', 'edit', 'delete', 'approve'],
            'employees.rewards' => ['view', 'create', 'edit', 'delete'],
            'crm.contacts' => ['view', 'create', 'edit', 'delete', 'import', 'export'],
            'crm.deals' => ['view', 'create', 'edit', 'delete'],
            'crm.quotes' => ['view', 'create', 'edit', 'delete'],
            'crm.chatbot' => ['view', 'manage'],
            'finance.invoices' => ['view', 'create', 'edit', 'delete'],
            'finance.payments' => ['view', 'create', 'edit', 'delete'],
            'analytics' => ['view'],
            'forms' => ['view', 'create', 'edit', 'delete'],
            'forms.submissions' => ['view', 'delete'],
            'settings' => ['view', 'edit'],
            'users' => ['view', 'create', 'edit', 'delete'],
            'roles' => ['view', 'create', 'edit', 'delete'],
            'audit' => ['view'],
        ];

        $allPermissions = [];
        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                $permName = "{$module}.{$action}";
                Permission::create(['name' => $permName]);
                $allPermissions[] = $permName;
            }
        }

        // ── Roles ──
        $superadmin = Role::create(['name' => 'superadmin']);
        $superadmin->givePermissionTo($allPermissions);

        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo($allPermissions);

        $manager = Role::create(['name' => 'manager']);
        $manager->givePermissionTo(array_filter($allPermissions, fn($p) =>
            !str_starts_with($p, 'settings.') &&
            !str_starts_with($p, 'roles.') &&
            !str_starts_with($p, 'audit.') &&
            $p !== 'users.delete'
        ));

        $teamLead = Role::create(['name' => 'team_lead']);
        $teamLead->givePermissionTo(array_filter($allPermissions, fn($p) =>
            str_starts_with($p, 'dashboard.') ||
            str_starts_with($p, 'crm.') ||
            str_starts_with($p, 'employees.') ||
            str_starts_with($p, 'forms.submissions.') ||
            $p === 'finance.invoices.view' ||
            $p === 'finance.payments.view'
        ));

        $employee = Role::create(['name' => 'employee']);
        $employee->givePermissionTo([
            'dashboard.view',
            'crm.contacts.view', 'crm.contacts.create', 'crm.contacts.edit',
            'crm.deals.view', 'crm.deals.create', 'crm.deals.edit',
            'employees.view', 'employees.leaves.view', 'employees.leaves.create',
            'employees.okr.view', 'employees.okr.create', 'employees.okr.edit',
            'employees.reviews.view',
            'forms.submissions.view',
        ]);

        $viewer = Role::create(['name' => 'viewer']);
        $viewer->givePermissionTo([
            'dashboard.view', 'crm.contacts.view', 'crm.deals.view',
            'employees.view', 'analytics.view',
        ]);

        // ── Departments ──
        $engineering = Department::create(['name' => 'Engineering', 'description' => 'Software Development & IT']);
        $sales = Department::create(['name' => 'Sales', 'description' => 'Business Development & Sales']);
        $marketing = Department::create(['name' => 'Marketing', 'description' => 'Marketing & Branding']);
        $hr = Department::create(['name' => 'Human Resources', 'description' => 'People & Culture']);
        $design = Department::create(['name' => 'Design', 'description' => 'UI/UX & Creative Design']);
        $finance = Department::create(['name' => 'Finance', 'description' => 'Accounting & Finance']);

        // ── Designations ──
        $designations = [
            ['name' => 'CEO', 'department_id' => null, 'level' => 1],
            ['name' => 'CTO', 'department_id' => $engineering->id, 'level' => 2],
            ['name' => 'VP Sales', 'department_id' => $sales->id, 'level' => 2],
            ['name' => 'Engineering Manager', 'department_id' => $engineering->id, 'level' => 3],
            ['name' => 'Senior Developer', 'department_id' => $engineering->id, 'level' => 4],
            ['name' => 'Developer', 'department_id' => $engineering->id, 'level' => 5],
            ['name' => 'Sales Manager', 'department_id' => $sales->id, 'level' => 3],
            ['name' => 'Sales Executive', 'department_id' => $sales->id, 'level' => 4],
            ['name' => 'Marketing Manager', 'department_id' => $marketing->id, 'level' => 3],
            ['name' => 'HR Manager', 'department_id' => $hr->id, 'level' => 3],
            ['name' => 'Designer', 'department_id' => $design->id, 'level' => 4],
        ];
        foreach ($designations as $d) {
            Designation::create($d);
        }

        // ── Superadmin User ──
        $superadminUser = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@thespacecode.com',
            'password' => bcrypt('Admin@123456'),
            'department_id' => null,
            'designation_id' => 1,
            'status' => 'active',
        ]);
        $superadminUser->assignRole('superadmin');

        // ── Demo Users ──
        $demoManager = User::create([
            'name' => 'Rahul Sharma',
            'email' => 'rahul@thespacecode.com',
            'password' => bcrypt('Manager@123'),
            'department_id' => $sales->id,
            'designation_id' => 7,
            'reporting_to' => $superadminUser->id,
            'status' => 'active',
        ]);
        $demoManager->assignRole('manager');

        $demoEmployee = User::create([
            'name' => 'Priya Patel',
            'email' => 'priya@thespacecode.com',
            'password' => bcrypt('Employee@123'),
            'department_id' => $sales->id,
            'designation_id' => 8,
            'reporting_to' => $demoManager->id,
            'status' => 'active',
        ]);
        $demoEmployee->assignRole('employee');

        // ── Leave Types ──
        LeaveType::create(['name' => 'Casual Leave', 'days_allowed' => 12, 'is_paid' => true]);
        LeaveType::create(['name' => 'Sick Leave', 'days_allowed' => 10, 'is_paid' => true]);
        LeaveType::create(['name' => 'Earned Leave', 'days_allowed' => 15, 'is_paid' => true]);
        LeaveType::create(['name' => 'Maternity Leave', 'days_allowed' => 180, 'is_paid' => true]);
        LeaveType::create(['name' => 'Unpaid Leave', 'days_allowed' => 30, 'is_paid' => false]);

        // ── Default Pipeline ──
        $pipeline = Pipeline::create(['name' => 'Sales Pipeline', 'is_default' => true]);
        $stages = [
            ['name' => 'Lead', 'order' => 1, 'color' => '#94A3B8'],
            ['name' => 'Qualified', 'order' => 2, 'color' => '#3B82F6'],
            ['name' => 'Proposal', 'order' => 3, 'color' => '#8B5CF6'],
            ['name' => 'Negotiation', 'order' => 4, 'color' => '#F59E0B'],
            ['name' => 'Won', 'order' => 5, 'color' => '#10B981'],
            ['name' => 'Lost', 'order' => 6, 'color' => '#EF4444'],
        ];
        foreach ($stages as $s) {
            DealStage::create(array_merge($s, ['pipeline_id' => $pipeline->id]));
        }

        // ── Demo Contacts ──
        $contacts = [
            ['first_name' => 'Amit', 'last_name' => 'Kumar', 'email' => 'amit@acmecorp.com', 'phone' => '+91-9876543210', 'company' => 'Acme Corp', 'source' => 'website', 'status' => 'lead', 'assigned_to' => $demoEmployee->id],
            ['first_name' => 'Sarah', 'last_name' => 'Johnson', 'email' => 'sarah@techstart.io', 'phone' => '+1-555-0123', 'company' => 'TechStart Inc', 'source' => 'referral', 'status' => 'customer', 'assigned_to' => $demoEmployee->id],
            ['first_name' => 'David', 'last_name' => 'Chen', 'email' => 'david@globex.com', 'phone' => '+1-555-0456', 'company' => 'Globex Solutions', 'source' => 'manual', 'status' => 'lead', 'assigned_to' => $demoManager->id],
        ];
        foreach ($contacts as $c) {
            $c['created_by'] = $superadminUser->id;
            Contact::create($c);
        }

        // ── Demo Deals ──
        Deal::create(['title' => 'Acme Website Redesign', 'contact_id' => 1, 'value' => 250000, 'currency' => 'INR', 'stage_id' => 3, 'pipeline_id' => $pipeline->id, 'assigned_to' => $demoEmployee->id, 'status' => 'open', 'probability' => 60, 'expected_close' => now()->addDays(30), 'created_by' => $superadminUser->id]);
        Deal::create(['title' => 'TechStart Mobile App', 'contact_id' => 2, 'value' => 500000, 'currency' => 'INR', 'stage_id' => 2, 'pipeline_id' => $pipeline->id, 'assigned_to' => $demoManager->id, 'status' => 'open', 'probability' => 40, 'expected_close' => now()->addDays(60), 'created_by' => $superadminUser->id]);

        // ── Chatbot Settings ──
        $chatSettings = [
            ['key' => 'bot_name', 'value' => 'SpaceBot'],
            ['key' => 'welcome_message', 'value' => 'Hi there! 👋 I\'m SpaceBot, your virtual assistant. How can I help you today?'],
            ['key' => 'fallback_message', 'value' => 'I\'m sorry, I couldn\'t find an answer to that. Would you like to speak with our team?'],
            ['key' => 'widget_position', 'value' => 'bottom-right'],
            ['key' => 'widget_color', 'value' => '#6366F1'],
            ['key' => 'collect_info_before_chat', 'value' => 'false'],
            ['key' => 'office_hours_enabled', 'value' => 'false'],
            ['key' => 'confidence_threshold', 'value' => '0.6'],
        ];
        foreach ($chatSettings as $cs) {
            ChatbotSetting::create($cs);
        }

        // ── Chatbot Categories & Entries ──
        $general = ChatbotCategory::create(['name' => 'General', 'description' => 'General inquiries', 'icon' => '💬', 'order' => 1]);
        $services = ChatbotCategory::create(['name' => 'Services', 'description' => 'Our services', 'icon' => '🚀', 'order' => 2]);
        $pricing = ChatbotCategory::create(['name' => 'Pricing', 'description' => 'Pricing related', 'icon' => '💰', 'order' => 3]);
        $support = ChatbotCategory::create(['name' => 'Support', 'description' => 'Technical support', 'icon' => '🛠️', 'order' => 4]);

        $entries = [
            ['category_id' => $general->id, 'question' => 'What does TheSpaceCode do?', 'answer' => 'TheSpaceCode is a full-service digital agency specializing in web development, mobile apps, UI/UX design, and digital marketing. We help businesses build powerful digital experiences.', 'keywords' => ['about', 'company', 'what', 'do', 'who'], 'intent' => 'about'],
            ['category_id' => $general->id, 'question' => 'Where is your office located?', 'answer' => 'We are based in India and serve clients globally. You can reach us at contact@thespacecode.com for more details.', 'keywords' => ['location', 'office', 'where', 'address', 'based'], 'intent' => 'location'],
            ['category_id' => $general->id, 'question' => 'How can I contact you?', 'answer' => 'You can reach us at contact@thespacecode.com or visit our website at thespacecode.com. We typically respond within 24 hours.', 'keywords' => ['contact', 'reach', 'email', 'touch'], 'intent' => 'contact'],
            ['category_id' => $services->id, 'question' => 'What services do you offer?', 'answer' => 'We offer: 🌐 Web Development (React, Laravel, Next.js), 📱 Mobile App Development (React Native, Flutter), 🎨 UI/UX Design, 📊 Digital Marketing & SEO, ☁️ Cloud Solutions & DevOps. Would you like to know more about any specific service?', 'keywords' => ['services', 'offer', 'provide', 'work', 'develop'], 'intent' => 'services'],
            ['category_id' => $pricing->id, 'question' => 'What are your pricing plans?', 'answer' => 'Our pricing depends on the project scope, complexity, and timeline. We offer flexible engagement models including fixed-price projects, hourly rates, and dedicated team hiring. Would you like to schedule a free consultation to get a custom quote?', 'keywords' => ['price', 'pricing', 'cost', 'rate', 'charge', 'fee', 'budget', 'quote'], 'intent' => 'pricing'],
            ['category_id' => $support->id, 'question' => 'I need technical support', 'answer' => 'For technical support, please email support@thespacecode.com with your issue details and project name. Our support team will get back to you within 4 hours during business hours.', 'keywords' => ['support', 'help', 'issue', 'problem', 'bug', 'error', 'fix'], 'intent' => 'support'],
        ];
        foreach ($entries as $e) {
            $e['is_active'] = true;
            $e['created_by'] = $superadminUser->id;
            ChatbotEntry::create($e);
        }
    }
}
