<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class PublisherController extends Controller
{
    /**
     * Display a listing of the publishers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $publishers = Publisher::all();
        return response()->json(['data' => $publishers], Response::HTTP_OK);
    }

    /**
     * Display the specified publisher.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $publisher = Publisher::find($id);

        if (!$publisher) {
            // Dòng 35, 78, 109
            return response()->json(['error' => 'Không tìm thấy nhà xuất bản'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['data' => $publisher], Response::HTTP_OK);
    }

    /**
     * Store a newly created publisher in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $publisher = Publisher::create([
            'name' => $request->name,
            'address' => $request->address,
        ]);

        return response()->json(['data' => $publisher], Response::HTTP_CREATED);
    }

    /**
     * Update the specified publisher in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $publisher = Publisher::find($id);

        if (!$publisher) {
            return response()->json(['error' => 'Không tìm thấy nhà xuất bản'], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $publisher->update([
            'name' => $request->name,
            'address' => $request->address,
        ]);

        return response()->json(['data' => $publisher], Response::HTTP_OK);
    }

    /**
     * Remove the specified publisher from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $publisher = Publisher::find($id);

        if (!$publisher) {
            return response()->json(['error' => 'Không tìm thấy nhà xuất bản'], Response::HTTP_NOT_FOUND);
        }

        $publisher->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
