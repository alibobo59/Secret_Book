<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class BookController extends Controller
{
    /**
     * Display a listing of the books.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $books = Book::with(['category', 'author', 'publisher'])->get();
        return response()->json(['data' => $books], Response::HTTP_OK);
    }

    /**
     * Display the specified book.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $book = Book::with(['category', 'author', 'publisher'])->find($id);

        if (!$book) {
            return response()->json(['error' => 'Book not found'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['data' => $book], Response::HTTP_OK);
    }

    /**
     * Store a newly created book in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'author_id' => 'required|exists:authors,id',
            'publisher_id' => 'required|exists:publishers,id',
            'published_year' => 'required|integer|min:1000|max:' . date('Y'),
            'price' => 'required|numeric|min:0', // Added validation for price
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $book = Book::create([
            'title' => $request->title,
            'category_id' => $request->category_id,
            'author_id' => $request->author_id,
            'publisher_id' => $request->publisher_id,
            'published_year' => $request->published_year,
            'price' => $request->price, // Add price to the book creation
        ]);

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
        'published_year' => 'required|integer|min:1000|max:' . date('Y'),
        'price' => 'required|numeric|min:0', // Added validation for price
    ]);

    if ($validator->fails()) {
        return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    $book->update([
        'title' => $request->title,
        'category_id' => $request->category_id,
        'author_id' => $request->author_id,
        'publisher_id' => $request->publisher_id,
        'published_year' => $request->published_year,
        'price' => $request->price, // Update the price
    ]);

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

        $book->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
