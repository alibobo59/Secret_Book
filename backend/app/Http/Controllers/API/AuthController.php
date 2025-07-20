<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $fields = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:3|confirmed',
            ]);

            $user = User::create([
                'name' => $fields['name'],
                'email' => $fields['email'],
                'password' => Hash::make($fields['password']),
                'role' => 'user',
            ]);

            $token = $user->createToken($request->name)->plainTextToken;

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Registration failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|string|email|max:255',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials',
                ], 401);
            }

            $token = $user->createToken($user->name)->plainTextToken;

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Login failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->tokens()->delete();
            return response()->json([
                'message' => 'Logged out successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Logout failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Gửi email reset password
     */
    public function forgotPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email'
            ], [
                'email.required' => 'Email là bắt buộc',
                'email.email' => 'Email không hợp lệ',
                'email.exists' => 'Email không tồn tại trong hệ thống'
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user->is_active) {
                return response()->json([
                    'message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
                ], 403);
            }

            // Tạo token reset password
            $token = Str::random(64);
            
            // Xóa token cũ nếu có
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

            // Tạo token mới
            DB::table('password_reset_tokens')->insert([
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]);

            // Gửi email
            Mail::send('emails.password-reset', [
                'user' => $user,
                'token' => $token,
                'resetUrl' => config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email)
            ], function($message) use ($request) {
                $message->to($request->email);
                $message->subject('Đặt lại mật khẩu - BookStore');
            });

            return response()->json([
                'message' => 'Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.'
            ]);

        } catch (\Exception $e) {
            Log::error('Forgot password error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.'
            ], 500);
        }
    }

    /**
     * Reset password với token
     */
    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
                'token' => 'required|string',
                'password' => 'required|string|min:6|confirmed'
            ], [
                'email.required' => 'Email là bắt buộc',
                'email.email' => 'Email không hợp lệ',
                'email.exists' => 'Email không tồn tại trong hệ thống',
                'token.required' => 'Token là bắt buộc',
                'password.required' => 'Mật khẩu là bắt buộc',
                'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự',
                'password.confirmed' => 'Xác nhận mật khẩu không khớp'
            ]);

            // Kiểm tra token
            $passwordReset = DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->first();

            if (!$passwordReset) {
                return response()->json([
                    'message' => 'Token không hợp lệ hoặc đã hết hạn'
                ], 400);
            }

            // Kiểm tra token có khớp không
            if (!Hash::check($request->token, $passwordReset->token)) {
                return response()->json([
                    'message' => 'Token không hợp lệ'
                ], 400);
            }

            // Kiểm tra token có hết hạn không (60 phút)
            if (Carbon::parse($passwordReset->created_at)->addMinutes(60)->isPast()) {
                DB::table('password_reset_tokens')
                    ->where('email', $request->email)
                    ->delete();
                    
                return response()->json([
                    'message' => 'Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.'
                ], 400);
            }

            // Cập nhật mật khẩu
            $user = User::where('email', $request->email)->first();
            $user->password = Hash::make($request->password);
            $user->save();

            // Xóa token đã sử dụng
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

            // Xóa tất cả token đăng nhập hiện tại
            $user->tokens()->delete();

            return response()->json([
                'message' => 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.'
            ]);

        } catch (\Exception $e) {
            Log::error('Reset password error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại sau.'
            ], 500);
        }
    }
}
