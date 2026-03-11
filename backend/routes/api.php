<?php

use App\Http\Controllers\DepartementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReclamationController;
use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/user', function (Request $request) {
    Auth::loginUsingId(1);
    return $request->user();
});

Route::post('auth/register',[AuthController::class,'register']);
Route::post('auth/login',[AuthController::class,'login']);

Route::middleware(['auth:sanctum'])->group(function () {
Route::apiResource('departements',DepartementController::class);
Route::apiResource('reclamations',ReclamationController::class);
Route::apiResource('users',UserController::class);
});