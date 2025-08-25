# Secret Book – Chatbot AI Patch

## What was added
- **Floating Chat UI** at `frontend/src/components/ChatBot.jsx` (auto-wired into `ClientLayout.jsx`).
- **API endpoint** `POST /api/ai/chat` (Laravel) in `backend/app/Http/Controllers/AiChatController.php` and route added in `routes/api.php`.
- **Config** entries in `config/services.php` and new `.env` keys.

## Setup (Dev)
1. In **backend** folder, set your OpenAI key in `.env`:
```
OPENAI_API_KEY=sk-...yourkey...
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
```
2. Start Laravel (inside `backend`):
```
php artisan serve
```
3. Start frontend (inside `frontend`):
```
npm install
npm run dev
```
4. Open the site, click the **💬 Chat AI** button bottom-right and chat.

## Notes
- The assistant has a default system prompt tailored for a bookstore. Edit `AI_SYSTEM_PROMPT` in backend `.env` to customize behavior.
- History is truncated to last 8 messages to save tokens. Adjust in `ChatBot.jsx` if needed.
- If you prefer another provider, extend the controller's `$provider` switch.
