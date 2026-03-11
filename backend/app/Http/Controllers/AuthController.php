<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request){
        $validated=$request->validate([
            'name'=> 'required|string|max:255',
            'email'=> 'required|string|email|max:255|unique:users',
            'password'=> 'required|string|min:8|confirmed',
            'cin'=>'string|max:8',
        ]);
        return $validated;
    
        $user = User:: create($validated);

         $token = $user->createToken('auth_token')->plainTextToken;

         return response()->json([
            'message'=>'user register successfully',
            'user'=>$user,
            'token'=>$token,
         ],201);
    }


    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password'=> 'required|string|min:8'
        ]);
    
        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }
    
        $user = $request->user(); // already authenticated user
        $token = $user->createToken('loginToken')->plainTextToken;
    
        return response()->json([
            'message' => 'success',
            'user' => $user,
            'token' => $token
        ], 200);
    }

    public function logout(Request $request){
          $request->user()->curentAccessToken->delete();
          return response()->json([
            'message'=> 'Loggout with success.'
            ]);
    }
}

