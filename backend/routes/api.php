<?php

use App\Http\Controllers\DepartementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReclamationController;
use App\Http\Controllers\SiteSettingController;
use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/user', function (Request $request) {
    return $request->user()->load('departement');
})->middleware('auth:sanctum');

Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('site-settings', [SiteSettingController::class, 'show']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('departements', DepartementController::class);
    Route::apiResource('reclamations', ReclamationController::class);
    Route::patch('reclamations/{reclamation}/refuse', [ReclamationController::class, 'refuse']);
    Route::apiResource('users', UserController::class);
    Route::post('site-settings', [SiteSettingController::class, 'update']);
});
