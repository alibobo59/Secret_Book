<?php

namespace App\Http\Controllers\API;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with(['category', 'author', 'publisher']);

        // Search
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhere('sku', 'like', '%' . $searchTerm . '%');
            });
        }

        // Category Filter
        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Author Filter
        if ($request->has('author_id')) {
            $query->where('author_id', $request->input('author_id'));
        }

        // Publisher Filter
        if ($request->has('publisher_id')) {
            $query->where('publisher_id', $request->input('publisher_id'));
        }

        // Default ordering by created date (newest first)
        $query->orderBy('created_at', 'desc');

        // Pagination
        $perPage = $request->input('per_page', 15); // Default to 15 items per page
        $books = $query->paginate($perPage);

        return response()->json($books, Response::HTTP_OK);
    }

    public function show($id)
    {
        $book = Book::with(['category', 'author', 'publisher', 'variations', 'reviews'])->find($id);
        if (!$book) {
            return response()->json(['error' => 'Book not found'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['data' => $book], Response::HTTP_OK);
    }

    public function store(Request $request)
    {
        // Preprocess variations to decode JSON attributes
        $input = $request->all();
        if (isset($input['variations'])) {
            foreach ($input['variations'] as &$variation) {
                if (isset($variation['attributes']) && is_string($variation['attributes'])) {
                    $variation['attributes'] = json_decode($variation['attributes'], true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        return response()->json([
                            'error' => ['variations.*.attributes' => ['Invalid JSON format in attributes.']]
                        ], Response::HTTP_UNPROCESSABLE_ENTITY);
                    }
                }
            }
            $request->merge(['variations' => $input['variations']]);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sku' => 'required|string|unique:books,sku',
            'stock_quantity' => 'required_without:variations|nullable|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'author_id' => 'nullable|exists:authors,id',
            'publisher_id' => 'nullable|exists:publishers,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'variations' => 'sometimes|array',
            'variations.*.attributes' => 'required|array',
            'variations.*.price' => 'nullable|numeric|min:0',
            'variations.*.stock_quantity' => 'required|integer|min:0',
            'variations.*.sku' => 'nullable|string|unique:book_variations,sku',
            'variations.*.image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // --- No changes to the main creation logic below, it is already good ---
        $bookData = $request->except(['image', 'variations']);

        $book = Book::create($bookData);

        if ($request->hasFile('image')) {
            $folder = 'books/' . $book->id;
            $image = $request->file('image');
            $imageName = 'book-' . $book->id . '-' . Str::slug($request->title) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs($folder, $imageName, 'public');
            $book->update(['image' => $imagePath]);
        }

        if ($request->has('variations')) {
            foreach ($request->variations as $index => $variationData) {
                $variation = $book->variations()->create([
                    'attributes' => $variationData['attributes'],
                    'price' => $variationData['price'] ?? $book->price,
                    'stock_quantity' => $variationData['stock_quantity'],
                    'sku' => $variationData['sku'],
                ]);

                if ($request->hasFile("variations.{$index}.image")) {
                    $folder = 'books/' . $book->id . '/variations/' . $variation->id;
                    $image = $request->file("variations.{$index}.image");
                    $imageName = 'variation-' . $variation->id . '-' . Str::slug($request->title) . '.' . $image->getClientOriginalExtension();
                    $imagePath = $image->storeAs($folder, $imageName, 'public');
                    $variation->update(['image' => $imagePath]);
                }
            }
        }

        return response()->json(['data' => $book->load(['category', 'author', 'publisher', 'variations', 'reviews'])], Response::HTTP_CREATED);
    }

    public function update(Request $request, $id)
    {
        // --- START: ALL LOGIC IS NEW/HEAVILY MODIFIED ---
        $book = Book::with('variations')->find($id);

        if (!$book) {
            return response()->json(['error' => 'Book not found'], Response::HTTP_NOT_FOUND);
        }

        // 1. Preprocess variations to decode JSON attributes, just like in store()
        $input = $request->all();
        if (isset($input['variations'])) {
            foreach ($input['variations'] as &$variation) {
                if (isset($variation['attributes']) && is_string($variation['attributes'])) {
                    $variation['attributes'] = json_decode($variation['attributes'], true);
                }
            }
            $request->merge(['variations' => $input['variations']]);
        }

        // 2. Update validation rules to handle variations and unique SKU check for update
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'sku' => 'required|string|unique:books,sku,' . $book->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required_without:variations|nullable|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'author_id' => 'nullable|exists:authors,id',
            'publisher_id' => 'nullable|exists:publishers,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'variations' => 'sometimes|array',
            'variations.*.id' => 'sometimes|exists:book_variations,id', // For existing variations
            'variations.*.attributes' => 'required|array',
            'variations.*.price' => 'nullable|numeric|min:0',
            'variations.*.stock_quantity' => 'required|integer|min:0',
            // Unique SKU check must ignore the variation's own ID
            'variations.*.sku' => 'nullable|string|unique:book_variations,sku,' . ($request->input('variations.*.id') ?? 'NULL') . ',id',
            'variations.*.image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // 3. Update the main book data
        $book->update($request->only([
            'title', 'sku', 'description', 'price', 'stock_quantity', 'category_id', 'author_id', 'publisher_id'
        ]));

        // Handle main image update
        if ($request->hasFile('image')) {
            // Delete old image
            if ($book->image && Storage::disk('public')->exists($book->image)) {
                Storage::disk('public')->delete($book->image);
            }
            // Store new image
            $folder = 'books/' . $book->id;
            $image = $request->file('image');
            $imageName = 'book-' . $book->id . '-' . Str::slug($request->title) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs($folder, $imageName, 'public');
            $book->update(['image' => $imagePath]);
        }

        // 4. Sync Variations (Create, Update, Delete)
        if ($request->has('variations')) {
            $incomingVariationIds = [];

            foreach ($request->variations as $index => $variationData) {
                $variationData['price'] = $variationData['price'] ?? $book->price;

                // Find existing or create new variation
                $variation = $book->variations()->findOrNew($variationData['id'] ?? 0);
                $variation->fill($variationData);
                $variation->book_id = $book->id;
                $variation->save();

                $incomingVariationIds[] = $variation->id;

                // Handle variation image
                if ($request->hasFile("variations.{$index}.image")) {
                    // Delete old image if it exists
                    if ($variation->image && Storage::disk('public')->exists($variation->image)) {
                        Storage::disk('public')->delete($variation->image);
                    }
                    $folder = 'books/' . $book->id . '/variations/' . $variation->id;
                    $image = $request->file("variations.{$index}.image");
                    $imageName = 'variation-' . $variation->id . '-' . Str::slug($request->title) . '.' . $image->getClientOriginalExtension();
                    $imagePath = $image->storeAs($folder, $imageName, 'public');
                    $variation->update(['image' => $imagePath]);
                }
            }

            // Delete variations that were removed on the frontend
            $book->variations()->whereNotIn('id', $incomingVariationIds)->get()->each(function($variation) {
                if ($variation->image && Storage::disk('public')->exists($variation->image)) {
                    Storage::disk('public')->delete($variation->image);
                }
                $variation->delete();
            });

        } elseif ($request->has('stock_quantity')) {
            // If switched from variable to simple, delete all variations
            $book->variations()->get()->each(function($variation) {
                if ($variation->image && Storage::disk('public')->exists($variation->image)) {
                    Storage::disk('public')->delete($variation->image);
                }
                $variation->delete();
            });
        }
        // --- END: MODIFIED LOGIC ---

        return response()->json(['data' => $book->load(['category', 'author', 'publisher', 'variations', 'reviews'])], Response::HTTP_OK);
    }

    public function destroy($id)
    {
        // --- START: MODIFIED LOGIC ---
        // Eager load variations to get their data
        $book = Book::with('variations')->find($id);
        if (!$book) {
            return response()->json(['error' => 'Book not found'], Response::HTTP_NOT_FOUND);
        }

        // Delete all variation images and the entire book folder
        $bookDirectory = 'books/' . $book->id;
        if (Storage::disk('public')->exists($bookDirectory)) {
            Storage::disk('public')->deleteDirectory($bookDirectory);
        }

        // The database cascade on delete should handle removing variation records.
        // If not, you would manually delete them: $book->variations()->delete();
        $book->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
        // --- END: MODIFIED LOGIC ---
    }

    // Bulk Operations
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:books,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $books = Book::with('variations')->whereIn('id', $request->ids)->get();
        $deletedCount = 0;

        foreach ($books as $book) {
            // Delete all images and directories for each book
            $bookDirectory = 'books/' . $book->id;
            if (Storage::disk('public')->exists($bookDirectory)) {
                Storage::disk('public')->deleteDirectory($bookDirectory);
            }
            $book->delete();
            $deletedCount++;
        }

        return response()->json([
            'message' => "Đã xóa thành công {$deletedCount} sách",
            'deleted_count' => $deletedCount
        ], Response::HTTP_OK);
    }

    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:books,id',
            'updates' => 'required|array',
            'updates.price' => 'sometimes|numeric|min:0',
            'updates.stock_quantity' => 'sometimes|integer|min:0',
            'updates.category_id' => 'sometimes|nullable|exists:categories,id',
            'updates.author_id' => 'sometimes|nullable|exists:authors,id',
            'updates.publisher_id' => 'sometimes|nullable|exists:publishers,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $updatedCount = Book::whereIn('id', $request->ids)
            ->update($request->updates);

        return response()->json([
            'message' => "Đã cập nhật thành công {$updatedCount} sách",
            'updated_count' => $updatedCount
        ], Response::HTTP_OK);
    }

    public function bulkStockUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'updates' => 'required|array|min:1',
            'updates.*.id' => 'required|integer|exists:books,id',
            'updates.*.stock_quantity' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $updatedCount = 0;
        foreach ($request->updates as $update) {
            Book::where('id', $update['id'])
                ->update(['stock_quantity' => $update['stock_quantity']]);
            $updatedCount++;
        }

        return response()->json([
            'message' => "Đã cập nhật kho cho {$updatedCount} sách",
            'updated_count' => $updatedCount
        ], Response::HTTP_OK);
    }

    public function bulkExport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'sometimes|array',
            'ids.*' => 'integer|exists:books,id',
            'format' => 'sometimes|string|in:csv,excel'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $query = Book::with(['category', 'author', 'publisher']);

        if ($request->has('ids')) {
            $query->whereIn('id', $request->ids);
        }

        $books = $query->get();

        $exportData = $books->map(function($book) {
            return [
                'ID' => $book->id,
                'Tiêu đề' => $book->title,
                'SKU' => $book->sku,
                'Mô tả' => $book->description,
                'Giá' => $book->price,
                'Số lượng kho' => $book->stock_quantity,
                'Danh mục' => $book->category ? $book->category->name : '',
                'Tác giả' => $book->author ? $book->author->name : '',
                'Nhà xuất bản' => $book->publisher ? $book->publisher->name : '',
                'Ngày tạo' => $book->created_at->format('Y-m-d H:i:s'),
                'Ngày cập nhật' => $book->updated_at->format('Y-m-d H:i:s')
            ];
        });

        return response()->json([
            'message' => "Đã xuất {$books->count()} sách",
            'data' => $exportData,
            'count' => $books->count()
        ], Response::HTTP_OK);
    }
}

// Dòng 57, 143, 258
return response()->json(['error' => 'Không tìm thấy sách'], Response::HTTP_NOT_FOUND);

// Dòng 72
'error' => ['variations.*.attributes' => ['Định dạng JSON không hợp lệ trong thuộc tính.']]
