<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    //
     public function register(Request $request){
       $fields = $request->validate([
           'name' => 'required|string|max:255',
           'email' => 'required|string|email|max:255|unique:users',
           'password' => 'required|string|min:8|confirmed',
       ]);
        // return $fields;

       $user =  User::create($fields);

       $token =$user->createToken($request->name);

       return[
        'user'=> $user,

        'token' => $token->plainTextToken,
       ];
    }

    public function login(Request $request){
        $request->validate([
           'email' => 'required|string|email|max:255|exists:users',
           'password' => 'required',
       ]);
       $user = User::where('email', $request->email)->first();
       if(!$user){
            return response([
               'message' => 'Invalid email'
           ], 401);
       }
       if(!Hash::check($request->password, $user->password)){
           return response([
               'message' => 'Invalid credentials'
           ], 401);

       }
       $token = $user->createToken($user->name);
    //    Auth::attempt([
    //        'email' => $request->email,
    //        'password' => $request->password,
    //    ]);
       return [
           'user' => $user,
           'token' => $token->plainTextToken,
       ];


    }

    public function logout(Request $request){
      $request->user()->tokens()->delete();
      return response([
          'message' => 'Logged out successfully'
      ]);
    }

}
