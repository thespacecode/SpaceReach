<?php
namespace App\Http\Controllers\CRM;
use App\Http\Controllers\Controller;
use App\Models\ChatbotCategory;
use App\Models\ChatbotEntry;
use App\Models\ChatbotConversation;
use App\Models\ChatbotUnanswered;
use App\Models\ChatbotSetting;
use App\Models\ChatbotSynonym;
use App\Models\ChatbotFlow;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatbotController extends Controller
{
    public function index()
    {
        return Inertia::render('CRM/Chatbot/Index', [
            'stats' => [
                'total_conversations' => ChatbotConversation::count(),
                'today_conversations' => ChatbotConversation::whereDate('started_at', today())->count(),
                'total_entries' => ChatbotEntry::where('is_active', true)->count(),
                'unanswered_count' => ChatbotUnanswered::where('status', 'pending')->count(),
            ],
            'categories' => ChatbotCategory::withCount('entries')->orderBy('order')->get(),
            'recentUnanswered' => ChatbotUnanswered::where('status', 'pending')->orderByDesc('occurrence_count')->take(10)->get(),
            'recentConversations' => ChatbotConversation::with('messages')->latest()->take(10)->get(),
            'settings' => ChatbotSetting::pluck('value', 'key'),
        ]);
    }

    public function entries(Request $request)
    {
        return Inertia::render('CRM/Chatbot/Entries', [
            'entries' => ChatbotEntry::with('category')->when($request->category, fn($q,$c) => $q->where('category_id', $c))->latest()->paginate(\App\Models\PortalSetting::paginationSize())->withQueryString(),
            'categories' => ChatbotCategory::orderBy('order')->get(),
            'filters' => $request->only('category', 'search'),
        ]);
    }

    public function storeEntry(Request $request)
    {
        $v = $request->validate(['category_id'=>'nullable|exists:chatbot_categories,id','question'=>'required|string','answer'=>'required|string','keywords'=>'nullable|array','intent'=>'nullable|string']);
        $v['created_by'] = auth()->id();
        $v['is_active'] = true;
        ChatbotEntry::create($v);
        return back()->with('success', 'Knowledge base entry added.');
    }

    public function updateEntry(Request $request, ChatbotEntry $entry)
    {
        $v = $request->validate(['category_id'=>'nullable|exists:chatbot_categories,id','question'=>'required|string','answer'=>'required|string','keywords'=>'nullable|array','intent'=>'nullable|string','is_active'=>'boolean']);
        $entry->update($v);
        return back()->with('success', 'Entry updated.');
    }

    public function deleteEntry(ChatbotEntry $entry)
    {
        $entry->delete();
        return back()->with('success', 'Entry deleted.');
    }

    public function conversations()
    {
        return Inertia::render('CRM/Chatbot/Conversations', [
            'conversations' => ChatbotConversation::with(['messages', 'convertedContact'])->latest()->paginate(\App\Models\PortalSetting::paginationSize()),
        ]);
    }

    public function unanswered()
    {
        return Inertia::render('CRM/Chatbot/Unanswered', [
            'questions' => ChatbotUnanswered::where('status', 'pending')->orderByDesc('occurrence_count')->paginate(\App\Models\PortalSetting::paginationSize()),
        ]);
    }

    public function settings()
    {
        return Inertia::render('CRM/Chatbot/Settings', [
            'settings' => ChatbotSetting::pluck('value', 'key'),
        ]);
    }

    public function updateSettings(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            if ($key !== '_token') ChatbotSetting::set($key, $value);
        }
        return back()->with('success', 'Chatbot settings updated.');
    }
}
