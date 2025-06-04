<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with('creator')->get();
        return response()->json(['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'required|string',
        ]);

        $category = Category::create([
            'name' => $validated['name'],

            'description' => $validated['description'],

        ]);

        return response()->json(['category' => $category->load('creator')], 201);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'required|string',
        ]);

        $category->update([
            'name' => $validated['name'],

            'description' => $validated['description'],
        ]);

        return response()->json(['category' => $category->load('creator')]);
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
