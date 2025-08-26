<?php

namespace App\Services;

use App\Models\Book;
use App\Models\BookEmbedding;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class EmbeddingService
{
    public function buildTextFromBook(Book $book): string
    {
        $text = trim((string)($book->description ?? ''));
        if ($text === '') {
            $text = (string)($book->title ?? '');
        }
        return Str::limit($text, 8000, '');
    }

    /**
     * @return float[]
     */
    public function embed(string $text): array
    {
        $apiKey = env('GEMINI_API_KEY');
        $model = env('GEMINI_EMBEDDING_MODEL', 'text-embedding-004');
        // Make sure empty env value falls back to default base URL
        $baseEnv = (string) env('GEMINI_BASE_URL', '');
        $base = rtrim($baseEnv !== '' ? $baseEnv : 'https://generativelanguage.googleapis.com/v1beta', '/');

        if (!$apiKey) {
            throw new \RuntimeException('GEMINI_API_KEY is not set');
        }

        $url = $base . '/models/' . $model . ':embedContent?key=' . $apiKey;

        $payload = [
            'model' => 'models/' . $model,
            'content' => [
                'parts' => [
                    ['text' => $text],
                ],
            ],
        ];

        $response = Http::timeout(15)->acceptJson()->post($url, $payload);
        if (!$response->successful()) {
            throw new \RuntimeException('Gemini embedding API error: ' . $response->status() . ' ' . $response->body());
        }

        $data = $response->json();
        $values = $data['embedding']['values'] ?? null;
        if (!is_array($values)) {
            if (isset($data['embeddings'][0]['values']) && is_array($data['embeddings'][0]['values'])) {
                $values = $data['embeddings'][0]['values'];
            } else {
                throw new \RuntimeException('Invalid embedding response shape');
            }
        }

        return $values;
    }

    public function upsertForBook(Book $book): BookEmbedding
    {
        $text = $this->buildTextFromBook($book);
        $values = $this->embed($text);
        $model = env('GEMINI_EMBEDDING_MODEL', 'text-embedding-004');

        return BookEmbedding::updateOrCreate(
            ['book_id' => $book->id],
            [
                'embedding' => $values,
                'dim' => count($values),
                'model' => $model,
            ]
        );
    }

    public function getForBook(Book $book): ?array
    {
        $emb = BookEmbedding::where('book_id', $book->id)->first();
        return $emb ? $emb->embedding : null;
    }
}