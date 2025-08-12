<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /** Return current authenticated user info */
    public function me(Request $request)
    {
        $user = $request->user();

        $payload = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => property_exists($user, 'phone') ? $user->phone : null,
            'created_at' => $user->created_at,
        ];

        if (Schema::hasColumn('users', 'avatar_url')) {
            $payload['avatar_url'] = $user->avatar_url;
        } else {
            $payload['avatar_url'] = null;
        }

        return response()->json(['user' => $payload]);
    }

    /** Change password */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'oldPassword' => 'required|string',
            'newPassword' => 'required|string|min:6',
        ]);

        if (!\Hash::check($data['oldPassword'], $user->password)) {
            throw ValidationException::withMessages([
                'oldPassword' => ['Mật khẩu hiện tại không đúng.'],
            ]);
        }

        $user->password = \Hash::make($data['newPassword']);
        $user->save();

        return response()->json(['message' => 'Đổi mật khẩu thành công.']);
    }

    /** Update avatar (multipart/form-data; field 'avatar'): returns { avatarUrl } */
    public function updateAvatar(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $file = $request->file('avatar');
        $ext = $file->getClientOriginalExtension() ?: 'jpg';
        $path = $file->storeAs('avatars', $user->id.'_'.time().'.'.$ext, 'public');

        $avatarUrl = Storage::disk('public')->url($path);

        if (Schema::hasColumn('users', 'avatar_url')) {
            $user->avatar_url = $avatarUrl;
            $user->save();
        }

        return response()->json(['avatarUrl' => $avatarUrl]);
    }
}
