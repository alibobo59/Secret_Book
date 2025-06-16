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
            'category_id' => 'required|exists:categories,id',
            'author_id' => 'required|exists:authors,id',
            'publisher_id' => 'required|exists:publishers,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'required|image|mimes:jpeg,png,jpg|max:2048', // Required image, 2MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $book = Book::create([
                'title' => $request->title,
                'isbn' => $request->isbn,
                'price' => $request->price,
                'stock' => $request->stock,
                'category_id' => $request->category_id,
                'author_id' => $request->author_id,
                'publisher_id' => $request->publisher_id,
            ]);

            $folder = storage_path('app/public/books/' . $book->id);
            if (!file_exists($folder)) {
                mkdir($folder, 0755, true);
            }

            $image = $request->file('image');
            $imageName = 'book-' . $book->id . '-' . Str::slug($request->title) . '.' . $image->getClientOriginalExtension();
            $image->move($folder, $imageName);
            $imagePath = 'books/' . $book->id . '/' . $imageName;

            $book->update(['image' => $imagePath]);
        }

        return response()->json(['data' => $book->load(['category', 'author', 'publisher'])], Response::HTTP_CREATED);
    }

    /**
     * Update the specified book in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['error' => 'Book not found'], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'author_id' => 'required|exists:authors,id',
            'publisher_id' => 'required|exists:publishers,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // Optional for update
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $data = [
            'title' => $request->title,
            'isbn' => $request->isbn,
            'price' => $request->price,
            'stock' => $request->stock,
            'category_id' => $request->category_id,
            'author_id' => $request->author_id,
            'publisher_id' => $request->publisher_id,
        ];

        // Handle image update
        if ($request->hasFile('image')) {
            $folder = storage_path('app/public/books/' . $book->id);
            if (!file_exists($folder)) {
                mkdir($folder, 0755, true);
            }

            if ($book->image && file_exists(storage_path('app/public/' . $book->image))) {
                unlink(storage_path('app/public/' . $book->image)); // Delete old image
            }

            $image = $request->file('image');
            $imageName = 'book-' . $book->id . '-' . Str::slug($request->title) . '.' . $image->getClientOriginalExtension();
            $image->move($folder, $imageName);
            $data['image'] = 'books/' . $book->id . '/' . $imageName;
        }

        $book->update($data);

        return response()->json(['data' => $book->load(['category', 'author', 'publisher'])], Response::HTTP_OK);
    }

    /**
     * Remove the specified book from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json(['error' => 'Book not found'], Response::HTTP_NOT_FOUND);
        }

        if ($book->image && file_exists(storage_path('app/public/' . $book->image))) {
            unlink(storage_path('app/public/' . $book->image)); // Delete image
            $folder = dirname(storage_path('app/public/' . $book->image));
            if (is_dir($folder) && count(scandir($folder)) <= 2) {
                rmdir($folder); // Remove folder if empty
            }
        }

        $book->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
