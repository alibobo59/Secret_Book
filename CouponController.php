<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use App\Models\CouponUsage;
use Carbon\Carbon;

class CouponController extends Controller
{
    public function index()
    {
        return response()->json(Coupon::all());
    }

    

    public function show($id)
    {
        return response()->json(Coupon::findOrFail($id));
    }

    

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();
        return response()->json(['message' => 'Coupon deleted']);
    }
    public function store(Request $request)
{
    $request->validate([
        'code'       => 'required|string|unique:coupons,code',
        'type'       => 'required|in:fixed,percent',
        'value'      => 'required|numeric|min:1',
        'max_uses'   => 'nullable|integer|min:1',
        'expires_at' => 'nullable|date|after:today',
    ]);

    $coupon = Coupon::create($request->only([
        'code', 'type', 'value', 'max_uses', 'expires_at'
    ]));

    return response()->json($coupon, 201);
}

public function update(Request $request, $id)
{
    $request->validate([
        'type'       => 'in:fixed,percent',
        'value'      => 'numeric|min:1',
        'max_uses'   => 'nullable|integer|min:1',
        'expires_at' => 'nullable|date|after:today',
    ]);

    $coupon = Coupon::findOrFail($id);
    $coupon->update($request->only([
        'code', 'type', 'value', 'max_uses', 'expires_at'
    ]));

    return response()->json($coupon);
}
public function applyCoupon(Request $request)
{
    $request->validate([
        'code'         => 'required|string',
        'order_amount' => 'required|numeric|min:1',
    ]);

    $coupon = Coupon::where('code', $request->code)->first();
    if (!$coupon) {
        return response()->json(['message' => 'Invalid coupon'], 404);
    }
}
