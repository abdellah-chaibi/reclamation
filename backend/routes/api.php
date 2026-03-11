<?php

use App\Http\Controllers\DepartementController;
use App\Http\Controllers\ReclamationController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/user', function (Request $request) {
    Auth::loginUsingId(1);
    return $request->user();
});


Route::apiResource('departements',DepartementController::class);
Route::apiResource('reclamations',ReclamationController::class);
Route::apiResource('users',UserController::class);
