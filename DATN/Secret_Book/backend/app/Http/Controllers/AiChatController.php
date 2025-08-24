<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AiChatController extends Controller
{
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:4000',
            'history' => 'array',
            'history.*.role' => 'required|string|in:user,assistant,system',
            'history.*.content' => 'required|string|max:4000',
        ]);

        $provider = config('services.ai.provider', env('AI_PROVIDER', 'openai'));
        $model = config('services.ai.model', env('AI_MODEL', 'gpt-4o-mini'));
        $systemPrompt = env('AI_SYSTEM_PROMPT', "Bạn là trợ lý AI của cửa hàng sách Secret Book. Trả lời ngắn gọn, hữu ích, lịch sự. Khi người dùng hỏi về đơn hàng/tài khoản, hướng dẫn họ đăng nhập và vào trang 'Đơn hàng'.");

        // Compose messages
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];
        if (!empty($validated['history'])) {
            foreach ($validated['history'] as $m) {
                $messages[] = ['role' => $m['role'], 'content' => $m['content']];
            }
        }
        $messages[] = ['role' => 'user', 'content' => $validated['message']];

        try {
            if ($provider === 'openai') {
                $apiKey = env('OPENAI_API_KEY');
                if (!$apiKey) {
                    return response()->json(['error' => 'OPENAI_API_KEY is not set'], 500);
                }

                // Use the Chat Completions API (Responses API compatible)
                $resp = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                        'Content-Type' => 'application/json',
                    ])->post('https://api.openai.com/v1/chat/completions', [
                        'model' => $model,
                        'messages' => $messages,
                        'temperature' => 0.5,
                        'max_tokens' => 600,
                    ]);

                if ($resp->failed()) {
                    Log::error('AI chat API error', ['status' => $resp->status(), 'body' => $resp->body()]);
                    return response()->json(['error' => 'AI provider request failed', 'details' => $resp->json()], 502);
                }

                $data = $resp->json();
                $text = $data['choices'][0]['message']['content'] ?? '';
                return response()->json([
                    'reply' => $text,
                    'provider' => $provider,
                    'model' => $model,
                ]);
            } else {
                return response()->json(['error' => 'Unsupported AI provider'], 400);
            }
        } catch (\Throwable $e) {
            Log::error('AI chat exception', ['exception' => $e]);
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }
}
