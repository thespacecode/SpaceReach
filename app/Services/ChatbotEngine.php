<?php

namespace App\Services;

use App\Models\ChatbotEntry;
use App\Models\ChatbotSetting;
use App\Models\ChatbotSynonym;

class ChatbotEngine
{
    private array $synonymMap = [];
    private array $stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for', 'on', 'with', 'at',
        'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
        'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
        'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each',
        'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own',
        'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or',
        'if', 'while', 'about', 'up', 'i', 'me', 'my', 'we', 'our', 'you', 'your',
        'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'this',
        'that', 'these', 'those', 'am', 'also', 'please', 'hi', 'hello', 'hey',
    ];

    public function __construct()
    {
        $this->loadSynonyms();
    }

    private function loadSynonyms(): void
    {
        $synonyms = ChatbotSynonym::all();
        foreach ($synonyms as $syn) {
            $word = strtolower($syn->word);
            foreach ($syn->synonyms as $s) {
                $this->synonymMap[strtolower($s)] = $word;
            }
            $this->synonymMap[$word] = $word;
        }
    }

    public function findAnswer(string $userMessage): array
    {
        $fallback = ChatbotSetting::get('fallback_message', "I'm sorry, I couldn't find an answer. Would you like to speak with our team?");

        // Preprocess
        $tokens = $this->tokenize($userMessage);
        if (empty($tokens)) {
            return ['answer' => $fallback, 'confidence' => 0, 'entry_id' => null, 'suggestions' => []];
        }

        // Expand tokens with synonyms
        $expandedTokens = $this->expandWithSynonyms($tokens);

        // Get all active entries
        $entries = ChatbotEntry::where('is_active', true)->get();
        if ($entries->isEmpty()) {
            return ['answer' => $fallback, 'confidence' => 0, 'entry_id' => null, 'suggestions' => []];
        }

        // Score each entry
        $scores = [];
        foreach ($entries as $entry) {
            $score = $this->scoreEntry($entry, $expandedTokens, $userMessage);
            if ($score > 0) {
                $scores[] = ['entry' => $entry, 'score' => $score];
            }
        }

        // Sort by score descending
        usort($scores, fn($a, $b) => $b['score'] <=> $a['score']);

        if (empty($scores)) {
            return ['answer' => $fallback, 'confidence' => 0, 'entry_id' => null, 'suggestions' => $this->getSuggestions()];
        }

        $best = $scores[0];
        $maxPossibleScore = 10; // Normalize to 0-1
        $confidence = min($best['score'] / $maxPossibleScore, 1.0);

        $threshold = (float) ChatbotSetting::get('confidence_threshold', '0.6');

        if ($confidence >= $threshold) {
            return [
                'answer' => $best['entry']->answer,
                'confidence' => round($confidence, 4),
                'entry_id' => $best['entry']->id,
                'suggestions' => [],
            ];
        }

        // Low confidence — return best guess with suggestions
        $suggestions = array_slice(array_map(fn($s) => $s['entry']->question, $scores), 0, 3);
        if ($confidence >= 0.3) {
            return [
                'answer' => $best['entry']->answer . "\n\n_Did this help? If not, here are some related topics:_",
                'confidence' => round($confidence, 4),
                'entry_id' => $best['entry']->id,
                'suggestions' => $suggestions,
            ];
        }

        return ['answer' => $fallback, 'confidence' => round($confidence, 4), 'entry_id' => null, 'suggestions' => $suggestions];
    }

    private function scoreEntry(ChatbotEntry $entry, array $userTokens, string $rawMessage): float
    {
        $score = 0.0;

        // 1. Keyword match (highest weight)
        $keywords = array_map('strtolower', $entry->keywords ?? []);
        foreach ($userTokens as $token) {
            if (in_array($token, $keywords)) {
                $score += 3.0;
            }
        }

        // 2. Question similarity (TF-IDF-like)
        $questionTokens = $this->tokenize($entry->question);
        $expandedQuestion = $this->expandWithSynonyms($questionTokens);
        $intersection = array_intersect($userTokens, $expandedQuestion);
        $union = array_unique(array_merge($userTokens, $expandedQuestion));
        if (!empty($union)) {
            $jaccard = count($intersection) / count($union);
            $score += $jaccard * 5.0;
        }

        // 3. Intent match
        if ($entry->intent) {
            $intentKeywords = explode('_', strtolower($entry->intent));
            foreach ($userTokens as $token) {
                if (in_array($token, $intentKeywords)) {
                    $score += 2.0;
                }
            }
        }

        // 4. Fuzzy match boost
        $rawLower = strtolower($rawMessage);
        $questionLower = strtolower($entry->question);
        similar_text($rawLower, $questionLower, $percent);
        $score += ($percent / 100) * 2.0;

        // 5. Priority boost
        $score += $entry->priority * 0.1;

        return $score;
    }

    private function tokenize(string $text): array
    {
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9\s]/', '', $text);
        $words = preg_split('/\s+/', trim($text));
        return array_values(array_filter($words, fn($w) => !in_array($w, $this->stopWords) && strlen($w) > 1));
    }

    private function expandWithSynonyms(array $tokens): array
    {
        $expanded = [];
        foreach ($tokens as $token) {
            $expanded[] = $token;
            if (isset($this->synonymMap[$token])) {
                $expanded[] = $this->synonymMap[$token];
            }
        }
        return array_unique($expanded);
    }

    private function getSuggestions(): array
    {
        return ChatbotEntry::where('is_active', true)
            ->orderByDesc('priority')
            ->take(3)
            ->pluck('question')
            ->toArray();
    }
}
