<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Console\Commands\TestEmail;
use App\Models\Book;
use App\Models\BookEmbedding;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Register the TestEmail command
// Artisan::command(TestEmail::class);

// Backfill embeddings for all books
Artisan::command('books:backfill-embeddings {--fresh : Xóa embeddings cũ trước khi tạo lại} {--missing : Chỉ tạo cho các sách chưa có embedding} {--only= : Danh sách ID sách, phân tách bằng dấu phẩy}', function () {
    $fresh = (bool) $this->option('fresh');
    $missing = (bool) $this->option('missing');
    $only = $this->option('only');

    if ($fresh) {
        $this->warn('Đang xóa embeddings cũ...');
        // Xóa sạch để tránh lỗi ràng buộc
        BookEmbedding::query()->delete();
    }

    $query = Book::query();

    if ($only) {
        $ids = collect(explode(',', $only))
            ->map(fn($id) => trim($id))
            ->filter()
            ->map(fn($id) => (int) $id)
            ->filter()
            ->values()
            ->all();
        if (empty($ids)) {
            $this->error('Tham số --only không hợp lệ.');
            return 1;
        }
        $query->whereIn('id', $ids);
    }

    if ($missing) {
        $hasEmbeddingIds = BookEmbedding::pluck('book_id')->all();
        if (!empty($hasEmbeddingIds)) {
            $query->whereNotIn('id', $hasEmbeddingIds);
        }
    }

    $total = $query->count();
    if ($total === 0) {
        $this->info('Không có sách nào để backfill.');
        return 0;
    }

    if (!env('GEMINI_API_KEY')) {
        $this->warn('Cảnh báo: GEMINI_API_KEY chưa được thiết lập. Việc gọi API có thể lỗi.');
    }

    $this->info("Xếp hàng job embeddings cho {$total} sách...");
    $bar = $this->output->createProgressBar($total);
    $bar->start();

    $dispatched = 0; $failed = 0;
    $query->chunk(100, function ($books) use ($bar, &$dispatched, &$failed) {
        foreach ($books as $book) {
            try {
                \App\Jobs\UpsertBookEmbedding::dispatch($book->id)->onQueue('embeddings');
                $dispatched++;
            } catch (\Throwable $e) {
                $failed++;
                $this->error("\n[Book #{$book->id}] Lỗi dispatch job: " . $e->getMessage());
            } finally {
                $bar->advance();
            }
        }
    });

    $bar->finish();
    $this->info("\nĐã dispatch {$dispatched} job(s). Thất bại khi dispatch: {$failed}.");

    return $failed === 0 ? 0 : 1;
})->purpose('Xếp job tạo/cập nhật embeddings cho sách (hỗ trợ --missing, --only)');
