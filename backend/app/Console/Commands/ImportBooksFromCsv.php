<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Book;
use App\Models\Author;
use App\Models\Publisher;
use App\Models\Category;
use App\Jobs\UpsertBookEmbedding;
use App\Services\ImageDownloadService;

class ImportBooksFromCsv extends Command
{
    protected $signature = 'books:import-csv 
        {--path= : Absolute path to CSV file}
        {--limit=0 : Import only N rows (0 means all)}
        {--download-images : Download thumbnail images to local storage}
        {--category-id= : Assign this Category ID to all imported books}
        {--category-name= : Assign this Category name to all imported books}
        {--random-category : Randomly assign an existing Category to each book}
        {--revert-first : Delete books by SKU from CSV (respecting --limit) before importing}
        {--add-variations : Also create 1-3 variations for some of the imported books}';

    protected $description = 'Import books from a CSV file with headers: title,authors,description,thumbnail,sku,publisher,price';

    public function handle(ImageDownloadService $imageService)
    {
        $path = $this->option('path') ?: base_path('../books_vietnamese_no_categories.csv');
        $limit = (int) $this->option('limit');
        $downloadImages = (bool) $this->option('download-images');

        // Category resolution strategy
        $categoryIdOpt = $this->option('category-id');
        $categoryNameOpt = $this->option('category-name');
        $randomCategoryOpt = (bool) $this->option('random-category');
        $addVariations = (bool) $this->option('add-variations');

        $resolvedCategoryId = null;
        if ($categoryIdOpt) {
            $resolvedCategoryId = (int) $categoryIdOpt;
            if (!Category::whereKey($resolvedCategoryId)->exists()) {
                $this->error("Category ID {$resolvedCategoryId} not found.");
                return 1;
            }
        } elseif ($categoryNameOpt) {
            $cat = Category::where('name', $categoryNameOpt)->first();
            if (!$cat) {
                $this->error("Category name '{$categoryNameOpt}' not found.");
                return 1;
            }
            $resolvedCategoryId = $cat->id;
        } elseif ($randomCategoryOpt) {
            $resolvedCategoryId = Category::inRandomOrder()->value('id');
            if (!$resolvedCategoryId) {
                $this->error('No categories available to assign.');
                return 1;
            }
        } else {
            // Default to random category if available
            $resolvedCategoryId = Category::inRandomOrder()->value('id');
            if ($resolvedCategoryId) {
                $this->warn('No category option provided. Using a random existing category by default.');
            } else {
                $this->error('No categories found in DB. Please seed categories first.');
                return 1;
            }
        }

        if (!is_file($path)) {
            $this->error("CSV not found: {$path}");
            return 1;
        }

        $this->info("Reading CSV: {$path}");
        $fh = fopen($path, 'r');
        if (!$fh) {
            $this->error('Cannot open CSV file.');
            return 1;
        }

        // Read header
        $header = fgetcsv($fh);
        if (!$header) {
            $this->error('Empty CSV.');
            fclose($fh);
            return 1;
        }
        $header = array_map(fn($h) => trim(strtolower($h)), $header);
        $required = ['title','authors','description','thumbnail','sku','publisher','price'];
        foreach ($required as $col) {
            if (!in_array($col, $header)) {
                $this->error("Missing required column: {$col}");
                fclose($fh);
                return 1;
            }
        }

        $colIndex = array_flip($header);

        // Revert first if requested
        if ($this->option('revert-first')) {
            fclose($fh); // close current handle to reuse path
            $this->revertByCsv($path, $limit);
            // reopen for import
            $fh = fopen($path, 'r');
            $header = fgetcsv($fh);
            $header = array_map(fn($h) => trim(strtolower($h)), $header);
            $colIndex = array_flip($header);
        }

        $rows = 0; $created = 0; $updated = 0; $errors = 0; $embedded = 0; $skippedNoAuthor = 0;

        while (($data = fgetcsv($fh)) !== false) {
            $rows++;
            if ($limit > 0 && ($created + $updated) >= $limit) {
                break;
            }

            try {
                $title = trim((string) ($data[$colIndex['title']] ?? ''));
                $authorsStr = trim((string) ($data[$colIndex['authors']] ?? ''));
                $description = (string) ($data[$colIndex['description']] ?? '');
                $thumbnail = trim((string) ($data[$colIndex['thumbnail']] ?? ''));
                $sku = trim((string) ($data[$colIndex['sku']] ?? ''));
                $publisherName = trim((string) ($data[$colIndex['publisher']] ?? ''));
                $priceRaw = trim((string) ($data[$colIndex['price']] ?? ''));

                if ($title === '' || $sku === '') {
                    $this->warn("Skip row #{$rows}: missing title or sku");
                    continue;
                }

                // Choose first author if multiple separated by comma/semicolon
                $authorName = '';
                if ($authorsStr !== '') {
                    $parts = array_filter(array_map('trim', preg_split('/[;,]/', $authorsStr)));
                    $authorName = $parts[0] ?? '';
                }

                // Enforce existing author requirement
                $author = null; $authorId = null;
                if ($authorName !== '') {
                    $author = Author::whereRaw('LOWER(name) = ?', [mb_strtolower($authorName)])->first();
                }
                if (!$author) {
                    $skippedNoAuthor++;
                    $this->warn("Skip row #{$rows}: author '{$authorName}' does not exist in DB.");
                    continue;
                }
                $authorId = $author->id;

                // Normalize price into 30k-500k VND and snap to nearest 1,000
                $price = $this->normalizePrice($priceRaw);

                DB::beginTransaction();

                // Publisher: optional, create if not exist (not explicitly required)
                $publisherId = null;
                if ($publisherName !== '') {
                    $publisher = Publisher::firstOrCreate(['name' => Str::limit($publisherName, 255, '')]);
                    $publisherId = $publisher->id;
                }

                $imagePath = null;
                if ($downloadImages && $thumbnail) {
                    $imagePath = $imageService->downloadToPublicBooks($thumbnail, $sku ?: $title);
                }

                // Random stock 1-200
                $stock = random_int(1, 200);

                $payload = [
                    'title' => $title,
                    'description' => $description,
                    'price' => $price,
                    'stock_quantity' => $stock,
                    'author_id' => $authorId,
                    'publisher_id' => $publisherId,
                    'category_id' => $resolvedCategoryId,
                ];

                // Prefer local image if downloaded, else keep original URL so frontend can still render
                if ($imagePath) {
                    $payload['image'] = $imagePath;
                } elseif ($thumbnail) {
                    $payload['image'] = $thumbnail;
                }

                $book = Book::where('sku', $sku)->first();
                if ($book) {
                    $book->fill($payload);
                    $book->save();
                    $updated++;
                } else {
                    $payload['sku'] = $sku;
                    $book = Book::create($payload);
                    $created++;
                }

                // Nếu bật tuỳ chọn, tạo 1-3 biến thể cho một số sách (xác suất ~50%)
                if ($addVariations) {
                    $this->maybeCreateVariations($book);
                }

                DB::commit();

                try {
                    UpsertBookEmbedding::dispatch($book->id)->onQueue('embeddings');
                    $embedded++;
                } catch (\Throwable $e) {
                    $this->warn('Failed to dispatch embedding job for book ID '.$book->id.': '.$e->getMessage());
                }

                $this->line("[OK] #{$book->id} {$book->title} ({$book->sku})");
            } catch (\Throwable $e) {
                DB::rollBack();
                $errors++;
                $this->error("Row #{$rows} error: ".$e->getMessage());
            }
        }

        fclose($fh);
        $this->info("Done. Created: {$created}, Updated: {$updated}, Skipped(no author): {$skippedNoAuthor}, Errors: {$errors}, Embedding dispatched: {$embedded}");
        $this->info('Tip: run `php artisan queue:work --queue=embeddings` to process embeddings.');
        return $errors === 0 ? 0 : 1;
    }

    private function normalizePrice(string $raw): int
    {
        $num = (int) preg_replace('/[^0-9]/', '', $raw);
        if ($num <= 0) {
            // random fallback 30k-80k (thousands)
            $num = random_int(30, 80) * 1000;
        }
        // scale down overly large values (often price*100 or *1000 from sources)
        while ($num > 500000) {
            $num = (int) round($num / 10);
            if ($num < 30000) break;
        }
        // clamp to range
        if ($num < 30000) $num = 30000;
        if ($num > 500000) $num = 500000;
        // snap to nearest 1,000
        $num = (int) (round($num / 1000) * 1000);
        // final safety clamp
        if ($num < 30000) $num = 30000;
        if ($num > 500000) $num = 500000;
        return $num;
    }

    private function maybeCreateVariations(Book $book): void
    {
        // 50% cơ hội bỏ qua để chỉ tạo biến thể cho một số sách
        if (random_int(0, 1) === 0) {
            return;
        }

        $basePrice = (int) ($book->price ?? 30000);
        $combos = [
            ['attrs' => ['hình thức' => 'bìa cứng', 'ngôn ngữ' => 'tiếng Việt'], 'suffix' => 'BC-VI', 'delta' => 20000],
            ['attrs' => ['hình thức' => 'bìa mềm', 'ngôn ngữ' => 'tiếng Việt'], 'suffix' => 'BM-VI', 'delta' => 0],
            ['attrs' => ['hình thức' => 'bìa cứng', 'ngôn ngữ' => 'tiếng Anh'], 'suffix' => 'BC-EN', 'delta' => 50000],
            ['attrs' => ['hình thức' => 'bìa mềm', 'ngôn ngữ' => 'tiếng Anh'], 'suffix' => 'BM-EN', 'delta' => 20000],
        ];
        shuffle($combos);
        $count = random_int(2, 3);
        $selected = array_slice($combos, 0, $count);

        foreach ($selected as $idx => $c) {
            $vPrice = $basePrice + (int) $c['delta'];
            // Snap to nearest 1,000 and clamp to [30k, 500k]
            $vPrice = (int) (round($vPrice / 1000) * 1000);
            if ($vPrice < 30000) $vPrice = 30000;
            if ($vPrice > 500000) $vPrice = 500000;

            $vSku = $book->sku . '-' . $c['suffix'];
            // Đảm bảo SKU biến thể là duy nhất trên toàn bảng
            if (DB::table('book_variations')->where('sku', $vSku)->exists()) {
                $vSku .= '-' . strtoupper(Str::random(4));
            }

            try {
                $variation = $book->variations()->create([
                    'attributes' => $c['attrs'],
                    'price' => $vPrice,
                    'stock_quantity' => random_int(5, 50),
                    'sku' => $vSku,
                ]);
                $this->line("  - Variation created: SKU={$variation->sku}, price={$variation->price}, stock={$variation->stock_quantity}");
            } catch (\Throwable $e) {
                // Không để lỗi biến thể làm hỏng việc import sách
                $this->warn('  - Failed to create variation: ' . $e->getMessage());
            }
        }
    }

    private function revertByCsv(string $path, int $limit = 0): void
    {
        $this->warn('Reverting previously imported books by SKU from CSV...');
        $fh = fopen($path, 'r');
        if (!$fh) {
            $this->error('Cannot open CSV for revert.');
            return;
        }
        $header = fgetcsv($fh);
        if (!$header) {
            fclose($fh);
            $this->error('Empty CSV during revert.');
            return;
        }
        $header = array_map(fn($h) => trim(strtolower($h)), $header);
        $idx = array_flip($header);
        if (!isset($idx['sku'])) {
            fclose($fh);
            $this->error('CSV missing sku column for revert.');
            return;
        }

        $count = 0; $deleted = 0; $notFound = 0; $imgDeleted = 0; $varDeleted = 0;

        while (($row = fgetcsv($fh)) !== false) {
            if ($limit > 0 && $count >= $limit) break;
            $sku = trim((string) ($row[$idx['sku']] ?? ''));
            if ($sku === '') continue;
            $count++;

            $book = Book::where('sku', $sku)->first();
            if (!$book) {
                $notFound++;
                $this->line("[revert] Skip SKU={$sku}: not found");
                continue;
            }

            DB::beginTransaction();
            try {
                // delete variations
                $varCnt = $book->variations()->count();
                if ($varCnt > 0) {
                    $book->variations()->delete();
                    $varDeleted += $varCnt;
                }

                // detach pivot categories if any
                try { $book->categories()->detach(); } catch (\Throwable $e) { /* ignore */ }

                // delete local image file if applicable
                $img = $book->image;
                if ($img && !preg_match('~^https?://~', $img)) {
                    if (Storage::disk('public')->exists($img)) {
                        Storage::disk('public')->delete($img);
                        $imgDeleted++;
                    }
                }

                $book->delete();
                DB::commit();
                $deleted++;
                $this->line("[revert] Deleted book SKU={$sku}");
            } catch (\Throwable $e) {
                DB::rollBack();
                $this->warn("[revert] Failed to delete book SKU={$sku}: ".$e->getMessage());
            }
        }
        fclose($fh);
        $this->info("Revert summary: Processed={$count}, Deleted={$deleted}, NotFound={$notFound}, VariationsDeleted={$varDeleted}, ImagesDeleted={$imgDeleted}");
    }
}