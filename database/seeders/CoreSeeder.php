<?php

namespace Database\Seeders;

use App\Models\ChatbotCategory;
use App\Models\ChatbotSetting;
use App\Models\DealStage;
use App\Models\Department;
use App\Models\Designation;
use App\Models\LeaveType;
use App\Models\Pipeline;
use App\Models\PortalSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class CoreSeeder extends Seeder
{
    protected array $adminData;

    public function __construct(array $adminData = [])
    {
        $this->adminData = $adminData;
    }

    public function run(): void
    {
        // ── Portal Settings ──
        $settings = [
            ['key' => 'company_name', 'value' => $this->adminData['company_name'] ?? 'SpaceReach Portal', 'type' => 'text', 'group' => 'general'],
            ['key' => 'company_tagline', 'value' => 'Enterprise Prospecting & CRM System', 'type' => 'text', 'group' => 'general'],
            ['key' => 'primary_color', 'value' => '#1863B8', 'type' => 'color', 'group' => 'appearance'],
            ['key' => 'secondary_color', 'value' => '#002B5C', 'type' => 'color', 'group' => 'appearance'],
            ['key' => 'accent_color', 'value' => '#B4CFED', 'type' => 'color', 'group' => 'appearance'],
            ['key' => 'sidebar_color', 'value' => '#002B5C', 'type' => 'color', 'group' => 'appearance'],
            ['key' => 'font_family', 'value' => 'Inter', 'type' => 'text', 'group' => 'appearance'],
            ['key' => 'logo', 'value' => null, 'type' => 'image', 'group' => 'appearance'],
            ['key' => 'favicon', 'value' => null, 'type' => 'image', 'group' => 'appearance'],
            ['key' => 'timezone', 'value' => 'UTC', 'type' => 'text', 'group' => 'general'],
            ['key' => 'currency', 'value' => 'USD', 'type' => 'text', 'group' => 'general'],
            ['key' => 'date_format', 'value' => 'Y-m-d', 'type' => 'text', 'group' => 'general'],
            ['key' => 'enforce_2fa', 'value' => 'false', 'type' => 'boolean', 'group' => 'security'],
            ['key' => 'session_timeout', 'value' => '120', 'type' => 'text', 'group' => 'security'],
        ];
        foreach ($settings as $s) {
            PortalSetting::updateOrCreate(['key' => $s['key']], $s);
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
                Permission::firstOrCreate(['name' => $permName]);
                $allPermissions[] = $permName;
            }
        }

        // ── Roles ──
        $superadmin = Role::firstOrCreate(['name' => 'superadmin']);
        $superadmin->syncPermissions($allPermissions);

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions($allPermissions);

        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->syncPermissions(array_filter($allPermissions, fn($p) =>
            !str_starts_with($p, 'settings.') &&
            !str_starts_with($p, 'roles.') &&
            !str_starts_with($p, 'audit.') &&
            $p !== 'users.delete'
        ));

        $teamLead = Role::firstOrCreate(['name' => 'team_lead']);
        $teamLead->syncPermissions(array_filter($allPermissions, fn($p) =>
            str_starts_with($p, 'dashboard.') ||
            str_starts_with($p, 'crm.') ||
            str_starts_with($p, 'employees.') ||
            str_starts_with($p, 'forms.submissions.') ||
            $p === 'finance.invoices.view' ||
            $p === 'finance.payments.view'
        ));

        $employee = Role::firstOrCreate(['name' => 'employee']);
        $employee->syncPermissions([
            'dashboard.view',
            'crm.contacts.view', 'crm.contacts.create', 'crm.contacts.edit',
            'crm.deals.view', 'crm.deals.create', 'crm.deals.edit',
            'employees.view', 'employees.leaves.view', 'employees.leaves.create',
            'employees.okr.view', 'employees.okr.create', 'employees.okr.edit',
            'employees.reviews.view',
            'forms.submissions.view',
        ]);

        $viewer = Role::firstOrCreate(['name' => 'viewer']);
        $viewer->syncPermissions([
            'dashboard.view', 'crm.contacts.view', 'crm.deals.view',
            'employees.view', 'analytics.view',
        ]);

        // ── Standard Departments ──
        $engineering = Department::firstOrCreate(['name' => 'Engineering'], ['description' => 'Software Development & IT']);
        $sales = Department::firstOrCreate(['name' => 'Sales'], ['description' => 'Business Development & Sales']);
        $marketing = Department::firstOrCreate(['name' => 'Marketing'], ['description' => 'Marketing & Branding']);
        $hr = Department::firstOrCreate(['name' => 'Human Resources'], ['description' => 'People & Culture']);
        $finance = Department::firstOrCreate(['name' => 'Finance'], ['description' => 'Accounting & Finance']);

        // ── Standard Designations ──
        $designations = [
            ['name' => 'CEO / Executive Director', 'department_id' => null, 'level' => 1],
            ['name' => 'CTO', 'department_id' => $engineering->id, 'level' => 2],
            ['name' => 'VP Sales', 'department_id' => $sales->id, 'level' => 2],
            ['name' => 'Engineering Lead', 'department_id' => $engineering->id, 'level' => 3],
            ['name' => 'Sales Manager', 'department_id' => $sales->id, 'level' => 3],
            ['name' => 'HR Manager', 'department_id' => $hr->id, 'level' => 3],
        ];
        foreach ($designations as $d) {
            Designation::firstOrCreate(['name' => $d['name']], $d);
        }

        // ── Superadmin User Creation ──
        $adminName = $this->adminData['name'] ?? 'Super Admin';
        $adminEmail = $this->adminData['email'] ?? 'admin@spacereach.com';
        $adminPassword = $this->adminData['password'] ?? 'Admin@123456';

        $superadminUser = User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => $adminName,
                'password' => Hash::make($adminPassword),
                'department_id' => null,
                'designation_id' => 1,
                'status' => 'active',
            ]
        );
        $superadminUser->assignRole('superadmin');

        // ── Standard Leave Types ──
        $leaveTypes = [
            ['name' => 'Casual Leave', 'days_allowed' => 12, 'is_paid' => true],
            ['name' => 'Sick Leave', 'days_allowed' => 10, 'is_paid' => true],
            ['name' => 'Earned Leave', 'days_allowed' => 15, 'is_paid' => true],
            ['name' => 'Unpaid Leave', 'days_allowed' => 30, 'is_paid' => false],
        ];
        foreach ($leaveTypes as $lt) {
            LeaveType::firstOrCreate(['name' => $lt['name']], $lt);
        }

        // ── Default Pipeline & Stages ──
        $pipeline = Pipeline::firstOrCreate(['name' => 'Sales Pipeline'], ['is_default' => true]);
        $stages = [
            ['name' => 'Lead', 'order' => 1, 'color' => '#94A3B8'],
            ['name' => 'Qualified', 'order' => 2, 'color' => '#3B82F6'],
            ['name' => 'Proposal', 'order' => 3, 'color' => '#8B5CF6'],
            ['name' => 'Negotiation', 'order' => 4, 'color' => '#F59E0B'],
            ['name' => 'Won', 'order' => 5, 'color' => '#10B981'],
            ['name' => 'Lost', 'order' => 6, 'color' => '#EF4444'],
        ];
        foreach ($stages as $s) {
            DealStage::firstOrCreate(
                ['name' => $s['name'], 'pipeline_id' => $pipeline->id],
                array_merge($s, ['pipeline_id' => $pipeline->id])
            );
        }

        // ── Default Chatbot Settings ──
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
            ChatbotSetting::firstOrCreate(['key' => $cs['key']], $cs);
        }

        // ── Default Chatbot Categories ──
        ChatbotCategory::firstOrCreate(['name' => 'General'], ['description' => 'General inquiries', 'icon' => '💬', 'order' => 1]);
        ChatbotCategory::firstOrCreate(['name' => 'Services'], ['description' => 'Our services', 'icon' => '🚀', 'order' => 2]);
        ChatbotCategory::firstOrCreate(['name' => 'Pricing'], ['description' => 'Pricing related', 'icon' => '💰', 'order' => 3]);
        ChatbotCategory::firstOrCreate(['name' => 'Support'], ['description' => 'Technical support', 'icon' => '🛠️', 'order' => 4]);
    }
}
