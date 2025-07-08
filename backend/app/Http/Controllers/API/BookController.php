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
    public function index()
    {
        return response()
        ->json([
            'data' => Book::with(['category', 'author', 'publisher', 'variations', 'reviews'])->get()
        ], Response::HTTP_OK);
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
}
