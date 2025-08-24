<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Province;
use App\Models\Ward;

class LocationController extends Controller
{
    /**
     * Lấy danh sách tất cả tỉnh/thành phố
     */
    public function getProvinces()
    {
        try {
            $provinces = Province::select('id', 'name')
                ->orderBy('name')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $provinces
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy danh sách tỉnh/thành phố',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Lấy danh sách phường/xã theo tỉnh/thành phố
     */
    public function getWards($provinceId)
    {
        try {
            $province = Province::find($provinceId);
            
            if (!$province) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tỉnh/thành phố không tồn tại'
                ], 404);
            }
            
            $wards = Ward::where('province_id', $provinceId)
                ->select('id', 'name')
                ->orderBy('name')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $wards,
                'province' => $province->name
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy danh sách phường/xã',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
