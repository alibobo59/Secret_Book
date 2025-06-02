<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index()
    {
        return response()->json(Coupon::all());
    }

    public function store(Request $request)
    {
        $coupon = Coupon::create($request->only([
            'code', 'type', 'value', 'max_uses', 'expires_at'
        ]));
        return response()->json($coupon, 201);
    }

    public function show($id)
    {
        return response()->json(Coupon::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update($request->only([
            'code', 'type', 'value', 'max_uses', 'expires_at'
        ]));
        return response()->json($coupon);
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();
        return response()->json(['message' => 'Coupon deleted']);
    }
}
