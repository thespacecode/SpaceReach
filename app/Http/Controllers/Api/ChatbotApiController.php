<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatbotConversation;
use App\Models\ChatbotEntry;
use App\Models\ChatbotMessage;
use App\Models\ChatbotSetting;
use App\Models\ChatbotSynonym;
use App\Models\ChatbotUnanswered;
use App\Models\Contact;
use App\Services\ChatbotEngine;
use Illuminate\Http\Request;

class ChatbotApiController extends Controller
{
    public function widgetSettings()
    {
        return response()->json([
            'bot_name' => ChatbotSetting::get('bot_name', 'SpaceBot'),
            'welcome_message' => ChatbotSetting::get('welcome_message', 'Hi! How can I help you?'),
            'widget_color' => ChatbotSetting::get('widget_color', '#6366F1'),
            'widget_position' => ChatbotSetting::get('widget_position', 'bottom-right'),
            'collect_info_before_chat' => ChatbotSetting::get('collect_info_before_chat', 'false') === 'true',
        ]);
    }

    public function startConversation(Request $request)
    {
        $sessionId = $request->input('session_id', uniqid('chat_', true));

        $conversation = ChatbotConversation::firstOrCreate(
            ['session_id' => $sessionId],
            [
                'visitor_name' => $request->input('name'),
                'visitor_email' => $request->input('email'),
                'visitor_ip' => $request->ip(),
                'started_at' => now(),
                'status' => 'active',
            ]
        );

        // Auto-link to contact if email provided
        if ($request->input('email')) {
            $contact = Contact::where('email', $request->input('email'))->first();
            if ($contact) {
                $conversation->update(['converted_contact_id' => $contact->id]);
            }
        }

        $welcome = ChatbotSetting::get('welcome_message', 'Hi! How can I help you?');

        ChatbotMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'bot',
            'message' => $welcome,
            'created_at' => now(),
        ]);

        return response()->json([
            'session_id' => $conversation->session_id,
            'message' => $welcome,
        ]);
    }

    public function message(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'message' => 'required|string|max:1000',
        ]);

        $conversation = ChatbotConversation::where('session_id', $request->session_id)->first();
        if (!$conversation) {
            return response()->json(['error' => 'Invalid session'], 400);
        }

        // Save visitor message
        ChatbotMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'visitor',
            'message' => $request->message,
            'created_at' => now(),
        ]);

        // Run matching engine
        $engine = new ChatbotEngine();
        $result = $engine->findAnswer($request->message);

        // Save bot response
        ChatbotMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'bot',
            'message' => $result['answer'],
            'matched_entry_id' => $result['entry_id'],
            'confidence_score' => $result['confidence'],
            'created_at' => now(),
        ]);

        // Track unanswered if low confidence
        $threshold = (float) ChatbotSetting::get('confidence_threshold', '0.6');
        if ($result['confidence'] < $threshold) {
            ChatbotUnanswered::updateOrCreate(
                ['question' => $request->message],
                ['occurrence_count' => \DB::raw('occurrence_count + 1'), 'last_asked_at' => now(), 'status' => 'pending']
            );
        }

        return response()->json([
            'message' => $result['answer'],
            'confidence' => $result['confidence'],
            'suggestions' => $result['suggestions'] ?? [],
        ]);
    }
}
