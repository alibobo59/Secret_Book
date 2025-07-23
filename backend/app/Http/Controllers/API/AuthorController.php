<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class AuthorController extends Controller
{
    /**
     * Display a listing of the authors.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $authors = Author::all();
        return response()->json(['data' => $authors], Response::HTTP_OK);
    }

    /**
     * Display the specified author.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $author = Author::find($id);

        if (!$author) {
            // Dòng 35, 78, 109
            return response()->json(['error' => 'Không tìm thấy tác giả'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['data' => $author], Response::HTTP_OK);
    }

    /**
     * Store a newly created author in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $author = Author::create([
            'name' => $request->name,
            'bio' => $request->bio,
        ]);

        return response()->json(['data' => $author], Response::HTTP_CREATED);
    }

    /**
     * Update the specified author in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $author = Author::find($id);

        if (!$author) {
            return response()->json(['error' => 'Không tìm thấy tác giả'], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $author->update([
            'name' => $request->name,
            'bio' => $request->bio,
        ]);

        return response()->json(['data' => $author], Response::HTTP_OK);
    }

    /**
     * Remove the specified author from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $author = Author::find($id);

        if (!$author) {
            return response()->json(['error' => 'Không tìm thấy tác giả'], Response::HTTP_NOT_FOUND);
        }

        $author->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
