<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class BookController extends Controller
{
    public function index()
    {
        return response()
        ->json([
            'data' => Book::with(['category', 'author', 'publisher', 'variations'])->get()
        ], Response::HTTP_OK);
    }

    public function show($id)
    {
        $book = Book::with(['category', 'author', 'publisher', 'variations'])->find($id);
        if (!$book) {
            return response()->json(['error' => 'Book not found'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['data' => $book], Response::HTTP_OK);
    }

    public function store(Request $request)
    {
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
            'variations.*.attributes' => 'required|array',
            'variations.*.price' => 'nullable|numeric|min:0',
            'variations.*.stock_quantity' => 'required|integer|min:0',
            'variations.*.sku' => 'nullable|string|unique:book_variations,sku',
            'variations.*.image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $data = $request->only([
            'title', 'description', 'price', 'sku', 'stock_quantity',
            'category_id', 'author_id', 'publisher_id'
        ]);

        $book = Book::create($data);

        if ($request->hasFile('image')) {
            $folder = 'books/' . $book->id;
            $image = $request->file('image');
            $imageName = 'book-' . $book->id . '-' . Str::slug($request->title) . '.' . $image->getClientOriginalExtension();
            $data['image'] = $image->storeAs($folder, $imageName, 'public');
            $book->update(['image' => $data['image']]);
        }

        if ($request->has('variations')) {
            foreach ($request->variations as $index => $variation) {
                if ($request->hasFile("variations.{$index}.image")) {
                    $folder = 'books/' . $book->id;
                    $image = $request->file("variations.{$index}.image");
                    $imageName = 'var-' . $book->id . '-' . $index . '.' . $image->getClientOriginalExtension();
                    $variation['image'] = $image->storeAs($folder, $imageName, 'public');
                }
                $book->variations()->create($variation);
            }
        }

        return response()->json(['data' => $book->load(['category', 'author', 'publisher', 'variations'])], Response::HTTP_CREATED);
    }

    public function update(Request $request, $id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json(['error' => 'Book not found'], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sku' => 'required|string|unique:books,sku,' . $id,
            'stock_quantity' => 'required_without:variations|nullable|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'author_id' => 'nullable|exists:authors,id',
            'publisher_id' => 'nullable|exists:publishers,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'variations.*.id' => 'nullable|exists:book_variations,id',
            'variations.*.attributes' => 'required|array',
            'variations.*.price' => 'nullable|numeric|min:0',
            'variations.*.stock_quantity' => 'required|integer|min:0',
            'variations.*.sku' => 'nullable|string|unique:book_variations,sku,' . ($variation['id'] ?? null),
            'variations.*.image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $data = $request->only([
            'title', 'description', 'price', 'sku', 'stock_quantity',
            'category_id', 'author_id', 'publisher_id'
        ]);

        if ($request->hasFile('image')) {
            if ($book->image && file_exists(storage_path('app/public/' . $book->image))) {
                unlink(storage_path('app/public/' . $book->image));
            }
            $folder = 'books/' . $book->id;
            $image = $request->file('image');
            $imageName = 'book-' . $book->id . '-' . Str::slug($request->title) . '.' . $image->getClientOriginalExtension();
            $data['image'] = $image->storeAs($folder, $imageName, 'public');
        }

        $book->update($data);

        if ($request->has('variations')) {
            $submittedIds = array_filter(array_column($request->variations, 'id') ?: []);
            $book->variations()->whereNotIn('id', $submittedIds)->each(function ($variation) {
                if ($variation->image && file_exists(storage_path('app/public/' . $variation->image))) {
                    unlink(storage_path('app/public/' . $variation->image));
                }
                $variation->delete();
            });

            foreach ($request->variations as $index => $variation) {
                if ($request->hasFile("variations.{$index}.image")) {
                    if (isset($variation['id'])) {
                        $existing = $book->variations()->find($variation['id']);
                        if ($existing->image && file_exists(storage_path('app/public/' . $existing->image))) {
                            unlink(storage_path('app/public/' . $existing->image));
                        }
                    }
                    $folder = 'books/' . $book->id;
                    $image = $request->file("variations.{$index}.image");
                    $imageName = 'var-' . $book->id . '-' . $index . '.' . $image->getClientOriginalExtension();
                    $variation['image'] = $image->storeAs($folder, $imageName, 'public');
                }
                if (isset($variation['id'])) {
                    $book->variations()->find($variation['id'])->update($variation);
                } else {
                    $book->variations()->create($variation);
                }
            }
        }

        return response()->json(['data' => $book->load(['category', 'author', 'publisher', 'variations'])], Response::HTTP_OK);
    }

    public function destroy($id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json(['error' => 'Book not found'], Response::HTTP_NOT_FOUND);
        }

        if ($book->image && file_exists(storage_path('app/public/' . $book->image))) {
            unlink(storage_path('app/public/' . $book->image));
        }
        $book->variations()->each(function ($variation) {
            if ($variation->image && file_exists(storage_path('app/public/' . $variation->image))) {
                unlink(storage_path('app/public/' . $variation->image));
            }
        });

        $book->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
