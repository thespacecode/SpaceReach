<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ChatbotApiController;

use App\Http\Controllers\Api\LeadApiController;

// Chatbot Widget API (no auth required, no CSRF)
Route::prefix('chatbot')->group(function () {
    Route::post('/message', [ChatbotApiController::class, 'message'])->name('chatbot.message');
    Route::post('/start', [ChatbotApiController::class, 'startConversation'])->name('chatbot.start');
    Route::get('/settings', [ChatbotApiController::class, 'widgetSettings'])->name('chatbot.settings');
});

// Public Lead Ingestion API / Webhook Endpoint
Route::post('/leads', [LeadApiController::class, 'ingest'])->name('api.leads.ingest');
Route::post('/leads/ingest', [LeadApiController::class, 'ingest']);

