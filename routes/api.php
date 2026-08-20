<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ChatbotApiController;
use App\Http\Controllers\Api\LeadApiController;

// Chatbot Widget API (Rate limited to 30 req/min per IP to prevent DoS)
Route::prefix('chatbot')->middleware('throttle:30,1')->group(function () {
    Route::post('/message', [ChatbotApiController::class, 'message'])->name('chatbot.message');
    Route::post('/start', [ChatbotApiController::class, 'startConversation'])->name('chatbot.start');
    Route::get('/settings', [ChatbotApiController::class, 'widgetSettings'])->name('chatbot.settings');
});

// Public Lead Ingestion Webhook API (Rate limited to 10 req/min per IP)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/leads', [LeadApiController::class, 'ingest'])->name('api.leads.ingest');
    Route::post('/leads/ingest', [LeadApiController::class, 'ingest']);
});
