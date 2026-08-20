<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'Dashboard' }} — {{ \App\Models\PortalSetting::get('company_name', 'AppLead') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family={{ str_replace(' ', '+', \App\Models\PortalSetting::get('font_family', 'Inter')) }}:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
    <style>
        :root {
            --primary: {{ \App\Models\PortalSetting::get('primary_color', '#1863B8') }};
            --secondary: {{ \App\Models\PortalSetting::get('secondary_color', '#002B5C') }};
            --accent: {{ \App\Models\PortalSetting::get('accent_color', '#B4CFED') }};
            --sidebar-bg: {{ \App\Models\PortalSetting::get('sidebar_color', '#002B5C') }};
            --font: '{{ \App\Models\PortalSetting::get('font_family', 'Inter') }}', -apple-system, sans-serif;
            --bg: #F5F7FA; --bg-card: #FFFFFF; --bg-hover: #EEF1F5;
            --text: #1A2332; --text-muted: #6B7A8D; --text-dim: #8896A6;
            --border: rgba(0,0,0,0.08); --success: #10B981; --warning: #F59E0B; --danger: #EF4444;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: var(--font); background: var(--bg); color: var(--text); display: flex; min-height: 100vh; }

        /* ── Sidebar ── */
        .sidebar {
            width: 260px; background: var(--sidebar-bg); border-right: 1px solid var(--border);
            display: flex; flex-direction: column; position: fixed; top: 0; left: 0;
            height: 100vh; z-index: 50; transition: transform 0.3s ease;
        }
        .sidebar-brand {
            padding: 20px 24px; border-bottom: 1px solid var(--border);
            display: flex; align-items: center; gap: 12px;
        }
        .sidebar-brand .brand-icon {
            width: 38px; height: 38px; border-radius: 10px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px;
        }
        .sidebar-brand h2 { font-size: 17px; font-weight: 700; }
        .sidebar-brand span { font-size: 11px; color: var(--text-muted); }

        .sidebar-nav { flex: 1; overflow-y: auto; padding: 12px 0; }
        .sidebar-nav::-webkit-scrollbar { width: 4px; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        .nav-section { padding: 8px 20px; margin-top: 8px; }
        .nav-section-label { font-size: 10px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1.5px; }

        .nav-item {
            display: flex; align-items: center; gap: 12px; padding: 10px 20px;
            color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 500;
            transition: all 0.2s ease; border-left: 3px solid transparent; cursor: pointer;
        }
        .nav-item:hover { color: var(--text); background: rgba(99,102,241,0.06); }
        .nav-item.active {
            color: var(--primary); background: rgba(99,102,241,0.1);
            border-left-color: var(--primary);
        }
        .nav-item i { font-size: 18px; width: 22px; text-align: center; }
        .nav-item .badge {
            margin-left: auto; background: var(--primary); color: white;
            font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px;
        }
        .nav-sub { display: none; padding-left: 20px; }
        .nav-sub.open { display: block; }
        .nav-item .arrow { margin-left: auto; transition: transform 0.2s; font-size: 14px; }
        .nav-item.expanded .arrow { transform: rotate(90deg); }

        .sidebar-footer { padding: 16px 20px; border-top: 1px solid var(--border); }
        .sidebar-user { display: flex; align-items: center; gap: 10px; }
        .sidebar-user img { width: 36px; height: 36px; border-radius: 10px; object-fit: cover; }
        .sidebar-user .user-info { flex: 1; }
        .sidebar-user .user-info .name { font-size: 13px; font-weight: 600; }
        .sidebar-user .user-info .role { font-size: 11px; color: var(--text-dim); }

        /* ── Main Content ── */
        .main { margin-left: 260px; flex: 1; min-height: 100vh; display: flex; flex-direction: column; }

        .topbar {
            height: 64px; background: rgba(15,23,42,0.8); backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border); display: flex; align-items: center;
            justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 40;
        }
        .topbar-left { display: flex; align-items: center; gap: 16px; }
        .topbar-left .breadcrumb { font-size: 13px; color: var(--text-muted); display: flex; gap: 8px; align-items: center; }
        .topbar-left .breadcrumb a { color: var(--text-dim); text-decoration: none; }
        .topbar-left .breadcrumb a:hover { color: var(--primary); }
        .topbar-left .breadcrumb .sep { color: var(--text-dim); }
        .topbar-left .page-title { font-size: 18px; font-weight: 700; }
        .mobile-toggle { display: none; background: none; border: none; color: var(--text); font-size: 22px; cursor: pointer; }

        .topbar-right { display: flex; align-items: center; gap: 8px; }
        .topbar-btn {
            width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--border);
            background: transparent; color: var(--text-muted); font-size: 18px;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s; position: relative;
        }
        .topbar-btn:hover { background: var(--bg-hover); color: var(--text); }
        .topbar-btn .notif-dot {
            position: absolute; top: 8px; right: 8px; width: 8px; height: 8px;
            background: var(--danger); border-radius: 50%;
        }

        .content { flex: 1; padding: 28px; }

        /* ── Reusable Components ── */
        .card {
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 16px; padding: 24px;
        }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-header h3 { font-size: 16px; font-weight: 700; }

        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 28px; }
        .stat-card {
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 16px; padding: 22px; position: relative; overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
        .stat-card .stat-icon {
            width: 44px; height: 44px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px; margin-bottom: 14px;
        }
        .stat-card .stat-value { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
        .stat-card .stat-label { font-size: 13px; color: var(--text-muted); }
        .stat-card .stat-change { font-size: 12px; font-weight: 600; margin-top: 8px; }
        .stat-card .stat-change.up { color: var(--success); }
        .stat-card .stat-change.down { color: var(--danger); }
        .stat-card::after {
            content: ''; position: absolute; top: 0; right: 0;
            width: 120px; height: 120px; border-radius: 50%;
            opacity: 0.04; transform: translate(30%, -30%);
        }

        .chart-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 28px; }

        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); }
        table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--border); }
        table tr:hover { background: rgba(99,102,241,0.04); }

        .badge-status {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
        }
        .badge-status.lead { background: rgba(148,163,184,0.15); color: #94A3B8; }
        .badge-status.qualified { background: rgba(59,130,246,0.15); color: #60A5FA; }
        .badge-status.proposal { background: rgba(139,92,246,0.15); color: #A78BFA; }
        .badge-status.won { background: rgba(16,185,129,0.15); color: #34D399; }
        .badge-status.lost { background: rgba(239,68,68,0.15); color: #F87171; }
        .badge-status.active { background: rgba(16,185,129,0.15); color: #34D399; }
        .badge-status.customer { background: rgba(16,185,129,0.15); color: #34D399; }
        .badge-status.open { background: rgba(59,130,246,0.15); color: #60A5FA; }
        .badge-status.pending { background: rgba(245,158,11,0.15); color: #FBBF24; }
        .badge-status.draft { background: rgba(148,163,184,0.15); color: #94A3B8; }
        .badge-status.sent { background: rgba(59,130,246,0.15); color: #60A5FA; }
        .badge-status.paid { background: rgba(16,185,129,0.15); color: #34D399; }
        .badge-status.overdue { background: rgba(239,68,68,0.15); color: #F87171; }
        .badge-status.approved { background: rgba(16,185,129,0.15); color: #34D399; }
        .badge-status.rejected { background: rgba(239,68,68,0.15); color: #F87171; }

        .btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 20px; border-radius: 10px; font-size: 13px;
            font-weight: 600; cursor: pointer; border: none; font-family: var(--font);
            transition: all 0.2s;
        }
        .btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 8px; }
        .btn-primary { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; }
        .btn-primary:hover { box-shadow: 0 4px 15px rgba(99,102,241,0.4); transform: translateY(-1px); }
        .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-muted); }
        .btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
        .btn-danger { background: rgba(239,68,68,0.1); color: #F87171; border: 1px solid rgba(239,68,68,0.2); }
        .btn-success { background: rgba(16,185,129,0.1); color: #34D399; border: 1px solid rgba(16,185,129,0.2); }

        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .form-control {
            width: 100%; padding: 10px 14px; font-size: 14px;
            background: rgba(30,41,59,0.8); border: 1px solid var(--border);
            border-radius: 10px; color: var(--text); outline: none; font-family: var(--font);
        }
        .form-control:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        select.form-control { appearance: none; cursor: pointer; }
        textarea.form-control { resize: vertical; min-height: 80px; }

        .search-box {
            display: flex; align-items: center; gap: 10px; padding: 8px 16px;
            background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px;
            max-width: 400px; width: 100%;
        }
        .search-box input { flex: 1; background: none; border: none; color: var(--text); outline: none; font-size: 14px; font-family: var(--font); }
        .search-box i { color: var(--text-dim); }

        .modal-overlay {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 100; align-items: center; justify-content: center;
            backdrop-filter: blur(4px);
        }
        .modal-overlay.active { display: flex; }
        .modal {
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 20px; padding: 32px; max-width: 560px; width: 90%;
            max-height: 85vh; overflow-y: auto;
        }
        .modal h2 { font-size: 20px; font-weight: 700; margin-bottom: 24px; }

        .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
        .tab {
            padding: 10px 18px; font-size: 13px; font-weight: 600; color: var(--text-dim);
            cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s;
            background: none; border-top: none; border-left: none; border-right: none; font-family: var(--font);
        }
        .tab:hover { color: var(--text); }
        .tab.active { color: var(--primary); border-bottom-color: var(--primary); }

        .avatar { width: 32px; height: 32px; border-radius: 8px; object-fit: cover; }
        .avatar-sm { width: 24px; height: 24px; border-radius: 6px; }
        .avatar-lg { width: 48px; height: 48px; border-radius: 12px; }

        .empty-state { text-align: center; padding: 48px 20px; color: var(--text-dim); }
        .empty-state i { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }
        .empty-state p { font-size: 14px; }

        .alert { padding: 14px 18px; border-radius: 12px; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
        .alert-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #34D399; }
        .alert-danger { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #F87171; }
        .alert-warning { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: #FBBF24; }

        .kanban { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; min-height: 400px; }
        .kanban-col { min-width: 280px; flex: 1; }
        .kanban-col-header { padding: 12px 16px; border-radius: 10px 10px 0 0; font-size: 13px; font-weight: 700; display: flex; justify-content: space-between; }
        .kanban-col-body { background: rgba(30,41,59,0.3); border-radius: 0 0 10px 10px; padding: 12px; min-height: 300px; }
        .kanban-card {
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 10px; padding: 14px; margin-bottom: 10px;
            cursor: grab; transition: all 0.2s;
        }
        .kanban-card:hover { border-color: var(--primary); transform: translateY(-1px); }
        .kanban-card .deal-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
        .kanban-card .deal-value { font-size: 16px; font-weight: 800; color: var(--primary); }
        .kanban-card .deal-meta { font-size: 12px; color: var(--text-dim); margin-top: 8px; display: flex; justify-content: space-between; }

        .pagination { display: flex; justify-content: center; gap: 4px; margin-top: 20px; }
        .pagination a, .pagination span {
            padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 500;
            color: var(--text-muted); text-decoration: none; border: 1px solid var(--border);
        }
        .pagination a:hover { background: var(--bg-hover); }
        .pagination .active span { background: var(--primary); color: white; border-color: var(--primary); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); }
            .main { margin-left: 0; }
            .mobile-toggle { display: block; }
            .stat-grid { grid-template-columns: 1fr 1fr; }
            .chart-grid { grid-template-columns: 1fr; }
            .kanban { flex-direction: column; }
            .kanban-col { min-width: 100%; }
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
            <div class="brand-icon">S</div>
            <div>
                <h2>{{ \App\Models\PortalSetting::get('company_name', 'AppLead') }}</h2>
                <span>CRM Portal</span>
            </div>
        </div>
        <nav class="sidebar-nav">
            <a href="{{ route('dashboard') }}" class="nav-item {{ request()->routeIs('dashboard') ? 'active' : '' }}">
                <i class="ri-dashboard-3-line"></i> Dashboard
            </a>

            <div class="nav-section"><div class="nav-section-label">Management</div></div>

            <div class="nav-item {{ request()->is('employees*') ? 'active expanded' : '' }}" onclick="toggleSub(this)">
                <i class="ri-team-line"></i> Employees <i class="ri-arrow-right-s-line arrow"></i>
            </div>
            <div class="nav-sub {{ request()->is('employees*') ? 'open' : '' }}">
                <a href="{{ route('employees.index') }}" class="nav-item {{ request()->routeIs('employees.index') ? 'active' : '' }}"><i class="ri-user-line"></i> All Employees</a>
                <a href="{{ route('employees.groups.index') }}" class="nav-item {{ request()->routeIs('employees.groups.*') ? 'active' : '' }}"><i class="ri-group-line"></i> Groups</a>
                <a href="{{ route('employees.leaves.index') }}" class="nav-item {{ request()->routeIs('employees.leaves.*') ? 'active' : '' }}"><i class="ri-calendar-check-line"></i> Leaves</a>
                <a href="{{ route('employees.okrs.index') }}" class="nav-item {{ request()->routeIs('employees.okrs.*') ? 'active' : '' }}"><i class="ri-target-line"></i> OKRs</a>
                <a href="{{ route('employees.reviews.index') }}" class="nav-item {{ request()->routeIs('employees.reviews.*') ? 'active' : '' }}"><i class="ri-star-line"></i> Peer Reviews</a>
                <a href="{{ route('employees.rewards.index') }}" class="nav-item {{ request()->routeIs('employees.rewards.*') ? 'active' : '' }}"><i class="ri-gift-line"></i> Rewards</a>
            </div>

            <div class="nav-item {{ request()->is('crm*') ? 'active expanded' : '' }}" onclick="toggleSub(this)">
                <i class="ri-contacts-book-line"></i> CRM <i class="ri-arrow-right-s-line arrow"></i>
            </div>
            <div class="nav-sub {{ request()->is('crm*') ? 'open' : '' }}">
                <a href="{{ route('crm.contacts.index') }}" class="nav-item {{ request()->routeIs('crm.contacts.*') ? 'active' : '' }}"><i class="ri-contacts-line"></i> Contacts</a>
                <a href="{{ route('crm.deals.index') }}" class="nav-item {{ request()->routeIs('crm.deals.*') ? 'active' : '' }}"><i class="ri-hand-coin-line"></i> Deals</a>
                <a href="{{ route('crm.quotes.index') }}" class="nav-item {{ request()->routeIs('crm.quotes.*') ? 'active' : '' }}"><i class="ri-file-text-line"></i> Quotes</a>
                <a href="{{ route('crm.chatbot.index') }}" class="nav-item {{ request()->routeIs('crm.chatbot.*') ? 'active' : '' }}"><i class="ri-robot-2-line"></i> Live Chat</a>
            </div>

            <div class="nav-item {{ request()->is('finance*') ? 'active expanded' : '' }}" onclick="toggleSub(this)">
                <i class="ri-money-dollar-circle-line"></i> Finance <i class="ri-arrow-right-s-line arrow"></i>
            </div>
            <div class="nav-sub {{ request()->is('finance*') ? 'open' : '' }}">
                <a href="{{ route('finance.invoices.index') }}" class="nav-item {{ request()->routeIs('finance.invoices.*') ? 'active' : '' }}"><i class="ri-bill-line"></i> Invoices</a>
                <a href="{{ route('finance.payments.index') }}" class="nav-item {{ request()->routeIs('finance.payments.*') ? 'active' : '' }}"><i class="ri-bank-card-line"></i> Payments</a>
            </div>

            <div class="nav-section"><div class="nav-section-label">Insights</div></div>

            <a href="{{ route('analytics.index') }}" class="nav-item {{ request()->routeIs('analytics.*') ? 'active' : '' }}">
                <i class="ri-bar-chart-2-line"></i> Analytics
            </a>
            <a href="{{ route('forms.index') }}" class="nav-item {{ request()->routeIs('forms.*') ? 'active' : '' }}">
                <i class="ri-survey-line"></i> Forms
            </a>

            @if(auth()->user()->hasRole('superadmin'))
            <div class="nav-section"><div class="nav-section-label">Administration</div></div>
            <a href="{{ route('admin.settings') }}" class="nav-item {{ request()->routeIs('admin.settings') ? 'active' : '' }}">
                <i class="ri-settings-3-line"></i> Settings
            </a>
            <a href="{{ route('admin.users') }}" class="nav-item {{ request()->routeIs('admin.users*') ? 'active' : '' }}">
                <i class="ri-user-settings-line"></i> Users & Roles
            </a>
            <a href="{{ route('admin.audit') }}" class="nav-item {{ request()->routeIs('admin.audit') ? 'active' : '' }}">
                <i class="ri-shield-check-line"></i> Audit Trail
            </a>
            @endif
        </nav>
        <div class="sidebar-footer">
            <div class="sidebar-user">
                <img src="{{ auth()->user()->avatar_url }}" alt="{{ auth()->user()->name }}">
                <div class="user-info">
                    <div class="name">{{ auth()->user()->name }}</div>
                    <div class="role">{{ auth()->user()->roles->first()?->name ?? 'User' }}</div>
                </div>
                <form method="POST" action="{{ route('logout') }}" style="margin:0;">
                    @csrf
                    <button type="submit" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:18px;" title="Sign Out">
                        <i class="ri-logout-box-r-line"></i>
                    </button>
                </form>
            </div>
        </div>
    </aside>

    <!-- Main Content -->
    <div class="main">
        <header class="topbar">
            <div class="topbar-left">
                <button class="mobile-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">
                    <i class="ri-menu-line"></i>
                </button>
                <div>
                    <div class="breadcrumb">
                        @yield('breadcrumb', '<a href="/">Dashboard</a>')
                    </div>
                    <div class="page-title">@yield('page-title', 'Dashboard')</div>
                </div>
            </div>
            <div class="topbar-right">
                <div class="search-box" style="max-width:260px;">
                    <i class="ri-search-line"></i>
                    <input type="text" placeholder="Search...">
                </div>
                <button class="topbar-btn" title="Notifications">
                    <i class="ri-notification-3-line"></i>
                    <span class="notif-dot"></span>
                </button>
                <button class="topbar-btn" title="Quick Actions" onclick="document.getElementById('quickActionsModal').classList.add('active')">
                    <i class="ri-add-line"></i>
                </button>
            </div>
        </header>

        <main class="content">
            @if(session('success'))
            <div class="alert alert-success"><i class="ri-check-line"></i> {{ session('success') }}</div>
            @endif
            @if(session('error'))
            <div class="alert alert-danger"><i class="ri-error-warning-line"></i> {{ session('error') }}</div>
            @endif
            @yield('content')
        </main>
    </div>

    <!-- Quick Actions Modal -->
    <div class="modal-overlay" id="quickActionsModal" onclick="if(event.target===this)this.classList.remove('active')">
        <div class="modal">
            <h2>Quick Actions</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <a href="{{ route('crm.contacts.create') }}" class="btn btn-ghost" style="justify-content:center;text-decoration:none;"><i class="ri-user-add-line"></i> New Contact</a>
                <a href="{{ route('crm.deals.create') }}" class="btn btn-ghost" style="justify-content:center;text-decoration:none;"><i class="ri-hand-coin-line"></i> New Deal</a>
                <a href="{{ route('crm.quotes.create') }}" class="btn btn-ghost" style="justify-content:center;text-decoration:none;"><i class="ri-file-add-line"></i> New Quote</a>
                <a href="{{ route('finance.invoices.create') }}" class="btn btn-ghost" style="justify-content:center;text-decoration:none;"><i class="ri-bill-line"></i> New Invoice</a>
                <a href="{{ route('forms.create') }}" class="btn btn-ghost" style="justify-content:center;text-decoration:none;"><i class="ri-survey-line"></i> New Form</a>
                <a href="{{ route('employees.leaves.create') }}" class="btn btn-ghost" style="justify-content:center;text-decoration:none;"><i class="ri-calendar-line"></i> Apply Leave</a>
            </div>
        </div>
    </div>

    <script>
    function toggleSub(el) {
        const sub = el.nextElementSibling;
        const isOpen = sub.classList.contains('open');
        // Close all subs
        document.querySelectorAll('.nav-sub').forEach(s => s.classList.remove('open'));
        document.querySelectorAll('.nav-item.expanded').forEach(n => n.classList.remove('expanded'));
        if (!isOpen) { sub.classList.add('open'); el.classList.add('expanded'); }
    }
    </script>
    @stack('scripts')
</body>
</html>
