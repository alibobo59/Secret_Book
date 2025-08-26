<?php

namespace App\Jobs;

use App\Models\Book;
use App\Services\EmbeddingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpsertBookEmbedding implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Số lần thử lại tối đa.
     */
    public int $tries = 3;

    /**
     * Khoảng backoff giữa các lần retry (giây).
     */
    public function backoff(): array
    {
        return [10, 60, 300];
    }

    public function __construct(public int $bookId)
    {
        // Chỉ dispatch sau khi DB transaction commit để tránh race condition.
        $this->afterCommit = true;
    }

    public function handle(EmbeddingService $service): void
    {
        $book = Book::find($this->bookId);
        if (!$book) {
            Log::warning("UpsertBookEmbedding: Book {$this->bookId} not found.");
            return;
        }

        $service->upsertForBook($book);
    }

    public function failed(\Throwable $e): void
    {
        Log::error("UpsertBookEmbedding failed for book {$this->bookId}: " . $e->getMessage());
    }
}