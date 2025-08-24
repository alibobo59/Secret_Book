<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class ImageUploadController extends Controller
{
    /**
     * Upload image for RichText Editor
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadEditorImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB
        ], [
            'image.required' => 'Vui lòng chọn ảnh để tải lên',
            'image.image' => 'File phải là ảnh',
            'image.mimes' => 'Ảnh phải có định dạng jpeg, png, jpg, gif hoặc webp',
            'image.max' => 'Ảnh không được vượt quá 5MB'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $image = $request->file('image');
            
            // Create unique filename
            $filename = 'editor-' . time() . '-' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            
            // Store in editor-images folder
            $folder = 'editor-images';
            $imagePath = $image->storeAs($folder, $filename, 'public');
            
            // Generate full URL
            $imageUrl = url('storage/' . $imagePath);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $imageUrl,
                    'path' => $imagePath,
                    'filename' => $filename
                ]
            ], Response::HTTP_OK);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Có lỗi xảy ra khi tải ảnh lên: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete uploaded editor image
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteEditorImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $path = $request->input('path');
            
            // Check if file exists and delete it
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Ảnh đã được xóa thành công'
                ], Response::HTTP_OK);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Không tìm thấy ảnh để xóa'
                ], Response::HTTP_NOT_FOUND);
            }
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Có lỗi xảy ra khi xóa ảnh: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}