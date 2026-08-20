<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CRM\ContactController;
use App\Http\Controllers\CRM\DealController;
use App\Http\Controllers\CRM\QuoteController;
use App\Http\Controllers\CRM\ChatbotController;
use App\Http\Controllers\Employee\EmployeeController;
use App\Http\Controllers\Employee\GroupController;
use App\Http\Controllers\Employee\LeaveController;
use App\Http\Controllers\Employee\OkrController;
use App\Http\Controllers\Employee\ReviewController;
use App\Http\Controllers\Employee\RewardController;
use App\Http\Controllers\Finance\InvoiceController;
use App\Http\Controllers\Finance\PaymentController;
use App\Http\Controllers\Forms\FormController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\Sales\LeadController;
use App\Http\Controllers\Sales\LeadSourceController;
use App\Http\Controllers\Sales\LeadJobController;
use App\Http\Controllers\Sales\LeadReviewController;
use App\Http\Controllers\Sales\LeadAnalyticsController;
use App\Http\Controllers\Api\ChatbotApiController;
use App\Http\Controllers\Api\GlobalSearchController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Installation Setup Wizard Routes
Route::prefix('install')->name('install.')->group(function () {
    Route::get('/', [\App\Http\Controllers\InstallController::class, 'index'])->name('index');
    Route::get('/check', [\App\Http\Controllers\InstallController::class, 'checkRequirements'])->name('check');
    Route::post('/test-db', [\App\Http\Controllers\InstallController::class, 'testDatabase'])->name('test-db');
    Route::post('/process', [\App\Http\Controllers\InstallController::class, 'process'])->name('process');
});

// Redirect root to login or dashboard
Route::get('/', function () {
    return auth()->check() ? redirect('/dashboard') : redirect('/login');
});

// Authenticated routes
Route::middleware(['auth'])->group(function () {

    // Global Search API
    Route::get('/api/global-search', [GlobalSearchController::class, 'search'])->name('api.global-search');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Employees ──
    Route::prefix('employees')->name('employees.')->group(function () {
        Route::get('/', [EmployeeController::class, 'index'])->name('index');

        // Groups
        Route::prefix('groups')->name('groups.')->group(function () {
            Route::get('/', [GroupController::class, 'index'])->name('index');
            Route::get('/create', [GroupController::class, 'create'])->name('create');
            Route::post('/', [GroupController::class, 'store'])->name('store');
            Route::delete('/{group}', [GroupController::class, 'destroy'])->name('destroy');
        });

        // Leaves
        Route::prefix('leaves')->name('leaves.')->group(function () {
            Route::get('/', [LeaveController::class, 'index'])->name('index');
            Route::get('/create', [LeaveController::class, 'create'])->name('create');
            Route::post('/', [LeaveController::class, 'store'])->name('store');
            Route::post('/{leave}/approve', [LeaveController::class, 'approve'])->name('approve');
            Route::post('/{leave}/reject', [LeaveController::class, 'reject'])->name('reject');
        });

        // OKRs
        Route::prefix('okrs')->name('okrs.')->group(function () {
            Route::get('/', [OkrController::class, 'index'])->name('index');
            Route::get('/create', [OkrController::class, 'create'])->name('create');
            Route::post('/', [OkrController::class, 'store'])->name('store');
        });

        // Peer Reviews
        Route::prefix('reviews')->name('reviews.')->group(function () {
            Route::get('/', [ReviewController::class, 'index'])->name('index');
            Route::get('/create', [ReviewController::class, 'create'])->name('create');
            Route::post('/', [ReviewController::class, 'store'])->name('store');
        });

        // Rewards
        Route::prefix('rewards')->name('rewards.')->group(function () {
            Route::get('/', [RewardController::class, 'index'])->name('index');
            Route::post('/', [RewardController::class, 'store'])->name('store');
        });

        // Employee details wildcard route (placed last)
        Route::get('/{employee}', [EmployeeController::class, 'show'])->name('show')->whereNumber('employee');
    });

    // ── Prospect & Enrich: Lead Acquisition Engine ──
    Route::prefix('leads')->name('sales.leads.')->group(function () {
        // Redirect removed sections to /leads
        Route::get('/sources', function() { return redirect('/leads'); })->name('sources');
        Route::get('/data', function() { return redirect('/leads'); })->name('data');
        Route::get('/jobs', function() { return redirect('/leads'); })->name('jobs');
        Route::get('/review', function() { return redirect('/leads'); })->name('review');
        Route::get('/analytics', function() { return redirect('/leads'); })->name('analytics');

        // Master Lead Sheet Database
        Route::get('/', [LeadController::class, 'index'])->name('index');
        Route::post('/', [LeadController::class, 'store'])->name('store');
        Route::put('/{lead}', [LeadController::class, 'update'])->name('update');
        Route::delete('/{lead}', [LeadController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-action', [LeadController::class, 'bulkAction'])->name('bulk-action');
        Route::post('/import', [LeadController::class, 'import'])->name('import');
        Route::patch('/{lead}/stage', [LeadController::class, 'updateStage'])->name('stage');
        Route::post('/{lead}/convert', [LeadController::class, 'convert'])->name('convert');
        Route::post('/{lead}/activity', [LeadController::class, 'storeActivity'])->name('activity');
    });

    // ── Contacts ──
    Route::post('/contacts/import', [ContactController::class, 'import'])->name('crm.contacts.import');
    Route::post('/contacts/bulk-delete', [ContactController::class, 'bulkDelete'])->name('crm.contacts.bulk-delete');
    Route::resource('contacts', ContactController::class)->names('crm.contacts');

    // ── Opportunity (Deals) ──
    Route::patch('/opportunity/{deal}/stage', [DealController::class, 'updateStage'])->name('crm.deals.updateStage');
    Route::resource('opportunity', DealController::class)->names('crm.deals');

    // ── Proposals (Quotes) ──
    Route::resource('proposals', QuoteController::class)->names('crm.quotes');

    // ── Clients ──
    Route::get('/clients', [ContactController::class, 'index'])->name('clients.index');

    // ── Chatbot ──
    Route::prefix('crm/chatbot')->name('crm.chatbot.')->group(function () {
        Route::get('/', [ChatbotController::class, 'index'])->name('index');
        Route::get('/entries', [ChatbotController::class, 'entries'])->name('entries');
        Route::post('/entries', [ChatbotController::class, 'storeEntry'])->name('entries.store');
        Route::put('/entries/{entry}', [ChatbotController::class, 'updateEntry'])->name('entries.update');
        Route::delete('/entries/{entry}', [ChatbotController::class, 'deleteEntry'])->name('entries.destroy');
        Route::get('/conversations', [ChatbotController::class, 'conversations'])->name('conversations');
        Route::get('/unanswered', [ChatbotController::class, 'unanswered'])->name('unanswered');
        Route::get('/settings', [ChatbotController::class, 'settings'])->name('settings');
        Route::post('/settings', [ChatbotController::class, 'updateSettings'])->name('settings.update');
    });

    // ── Legacy Route Redirects ──
    Route::get('/crm/deals', function() { return redirect('/opportunity'); });
    Route::get('/crm/quotes', function() { return redirect('/proposals'); });
    Route::get('/crm/contacts', function() { return redirect('/contacts'); });
    Route::get('/customers/accounts', function() { return redirect('/clients'); });
    Route::get('/customers/contacts', function() { return redirect('/contacts'); });

    // ── Finance ──
    Route::prefix('finance')->name('finance.')->group(function () {
        Route::resource('invoices', InvoiceController::class);
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
    });

    // ── Analytics ──
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');


    // ── Reports ──
    Route::get('/reports', [AnalyticsController::class, 'reports'])->name('reports.index');

    // ── Navigation Architecture Demo ──
    Route::get('/navigation-demo', function() {
        return \Inertia\Inertia::render('NavigationDemo');
    })->name('navigation-demo');

    // ── Enterprise Design System ──
    Route::get('/design-system', function() {
        return \Inertia\Inertia::render('DesignSystem');
    })->name('design-system');

    // ── Onboarding ──
    Route::get('/onboarding', function() {
        return \Inertia\Inertia::render('Auth/Onboarding');
    })->name('onboarding');

    // ── Forms ──
    Route::resource('forms', FormController::class);

    // ── Settings & Team RBAC (Clean URLs without /admin/ prefix) ──
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::get('/users', [UserController::class, 'index'])->name('users');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Backwards compatibility redirects
    Route::get('/admin/settings', function() { return redirect('/settings' . (request()->getQueryString() ? '?' . request()->getQueryString() : '')); });
    Route::get('/admin/users', function() { return redirect('/users'); });
    Route::get('/admin/audit', function() { return redirect('/settings?tab=audit'); });
    Route::get('/audit', function() { return redirect('/settings?tab=audit'); });

});

// ── Public Routes ──
Route::post('/forms/{slug}/submit', [FormController::class, 'submit'])->name('forms.submit');
Route::get('/forms/{slug}/embed', [FormController::class, 'embed'])->name('forms.embed');

// ── Chatbot API (public, for widget) ──
Route::prefix('api/chatbot')->group(function () {
    Route::post('/message', [ChatbotApiController::class, 'message'])->name('api.chatbot.message');
    Route::post('/start', [ChatbotApiController::class, 'startConversation'])->name('api.chatbot.start');
    Route::get('/settings', [ChatbotApiController::class, 'widgetSettings'])->name('api.chatbot.settings');
});

// ── Stock Ticker (public, for login page) ──
Route::get('/api/stock-ticker', [\App\Http\Controllers\Api\StockTickerController::class, 'index'])->name('api.stock-ticker');
