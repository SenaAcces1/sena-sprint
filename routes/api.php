<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\EquipmentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas de autenticación con Sanctum
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-guest', [AuthController::class, 'registerGuest']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('role');
    });

    // General User Routes (Accessible by Apprentice and others)
    Route::get('/my-ingresos', [AdminController::class, 'getMyIngresos']);
    Route::get('/my-equipment', [EquipmentController::class, 'getMyEquipment']);
    Route::put('/my-profile', [AdminController::class, 'updateMyProfile']);

    // Admin Routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'index']);
        Route::get('/ingresos', [AdminController::class, 'getIngresos']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/roles', [AdminController::class, 'getRoles']);

        // Equipment Voucher Routes
        Route::get('/equipment', [EquipmentController::class, 'index']);
        Route::post('/equipment', [EquipmentController::class, 'store']);
    });
});
