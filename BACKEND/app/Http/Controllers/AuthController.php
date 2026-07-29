<?php

namespace App\Http\Controllers;

use App\Models\Bisnis;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'full_name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ]);
        };

        $user = User::create($request->all());
        $token = $user->createToken('auth_token')->plainTextToken;
        $data = [
            'name' => $user->full_name,
            'email' => $user->email,
            'updated_at' => $user->updated_at,
            'created_at' => $user->created_at,
            'id' => $user->id,
            'token' => $token,
        ];
        return $this->success("Registration successful", $data, 201);
    }

    public function login(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ]);
        };

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->error("Username or password incorrect");
        }
        $token = $user->createToken('auth_token')->plainTextToken;

        $data = [
            'id' => $user->id,
            'name' => $user->full_name,
            'email' => $user->email,
            'updated_at' => $user->updated_at,
            'created_at' => $user->created_at,
            'token' => $token,
        ];
        return $this->success("Login successful", $data, 201);
    }


    public function logout(Request $request)
    {
        $token = PersonalAccessToken::findToken($request->bearerToken());
        $token->delete();

        return $this->success("Logout successful",);
    }


    public function me()
    {
        $user = Auth::user();
        $bisnis = Bisnis::where('user_id', $user->id)->first() || null;

        return response()->json([
            'data' => [
                'user' => $user,
                'bisnis' => $bisnis
            ]
        ]);
    }
}
