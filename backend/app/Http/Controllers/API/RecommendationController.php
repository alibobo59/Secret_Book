<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookEmbedding;
use App\Services\EmbeddingService;
use App\Services\VectorMath;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RecommendationController extends Controller
{
    public function related(Request $request, Book $book)
    {
        $limit = 4; // cố định 4 theo yêu cầu

        // Ensure target embedding
        $targetEmbedding = optional(BookEmbedding::where('book_id', $book->id)->first())->embedding;
        if (!$targetEmbedding) {
            // Không blocking: dispatch job để tạo embedding và trả về rỗng lần này
            try {
                \App\Jobs\UpsertBookEmbedding::dispatch($book->id)->onQueue('embeddings');
            } catch (\Throwable $e) {
                // ghi log nhưng không chặn response
                \Illuminate\Support\Facades\Log::warning('Dispatch UpsertBookEmbedding from related failed: ' . $e->getMessage());
            }
            return response()->json(['data' => []], Response::HTTP_OK);
        }

        $candidates = BookEmbedding::where('book_id', '!=', $book->id)->get(['book_id', 'embedding']);

        $scores = [];
        foreach ($candidates as $cand) {
            $scores[$cand->book_id] = VectorMath::cosineSimilarity($targetEmbedding, $cand->embedding);
        }

        arsort($scores);
        $topIds = array_slice(array_keys($scores), 0, $limit);

        if (empty($topIds)) {
            return response()->json(['data' => []], Response::HTTP_OK);
        }

        $books = Book::with(['category', 'author', 'publisher', 'variations'])
            ->whereIn('id', $topIds)
            ->get()
            ->keyBy('id');

        $ordered = [];
        foreach ($topIds as $id) {
            if (isset($books[$id])) {
                $ordered[] = $books[$id];
            }
        }

        return response()->json($ordered, Response::HTTP_OK);
    }
}