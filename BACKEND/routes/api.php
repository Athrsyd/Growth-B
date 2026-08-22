<?php

use App\Http\Controllers\AnalisisController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BisnisController;
use App\Http\Controllers\ChartController;
use App\Http\Controllers\DataHarianController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoadmapController;
use App\Http\Controllers\WhatIfController;
use Illuminate\Support\Facades\Route;

// ─── Auth (public) ───────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ─── Member scan QR (public, dipanggil dari frontend pelanggan) ──
Route::get('/member/scan/{token}', [MemberController::class, 'scan']);
Route::post('/member/checkin/{token}', [MemberController::class, 'checkin']);

// ─── Protected ───────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Bisnis
    Route::post('/bisnis', [BisnisController::class, 'store']);
    Route::get('/bisnis/{id}', [BisnisController::class, 'show']);
    Route::put('/bisnis/{id}', [BisnisController::class, 'update']);
    Route::get('/bisnis/qr/{token}', [BisnisController::class, 'GenerateQR']);
    Route::get('/bisnis/qr-image/{token}', [BisnisController::class, 'qrImage']);

    // Produk
    Route::get('/produk', [ProductController::class, 'index']);
    Route::post('/produk', [ProductController::class, 'store']);
    Route::get('/produk/{id}', [ProductController::class, 'show']);
    Route::put('/produk/{id}', [ProductController::class, 'update']);
    Route::delete('/produk/{id}/image', [ProductController::class, 'removeImage']);
    Route::delete('/produk/{id}', [ProductController::class, 'destroy']);

    // Data Harian
    Route::get('/data-harian', [DataHarianController::class, 'index']);
    Route::post('/data-harian', [DataHarianController::class, 'store']);
    Route::get('/data-harian/summary', [DataHarianController::class, 'summary']);
    Route::get('/data-harian/{id}', [DataHarianController::class, 'show']);
    Route::put('/data-harian/{id}', [DataHarianController::class, 'update']);
    Route::delete('/data-harian/{id}', [DataHarianController::class, 'destroy']);

    // Member (dashboard pemilik)
    Route::get('/member', [MemberController::class, 'index']);
    Route::get('/member/reward', [MemberController::class, 'eligibleReward']);
    Route::post('/member/reward/set', [MemberController::class, 'setRewardThreshold']);
    Route::get('/member/{id}', [MemberController::class, 'show']);
    Route::delete('/member/{id}', [MemberController::class, 'destroy']);

    // Analisa AI
    Route::get('/analisa', [AnalisisController::class, 'index']);
    Route::get('/analisa/status', [AnalisisController::class, 'status']);
    Route::get('/analisa/latest', [AnalisisController::class, 'latest']);
    Route::post('/analisa/generate', [AnalisisController::class, 'generate']);
    Route::get('/analisa/{id}', [AnalisisController::class, 'show']);
    Route::delete('/analisa/{id}', [AnalisisController::class, 'destroy']);


    // Roadmap
    Route::get('/roadmap', [RoadmapController::class, 'index']);
    Route::post('/roadmap', [RoadmapController::class, 'store']);
    Route::get('/roadmap/{id}', [RoadmapController::class, 'show']);
    Route::put('/roadmap/{id}', [RoadmapController::class, 'update']);
    Route::delete('/roadmap/{id}', [RoadmapController::class, 'destroy']);

    // What If
    Route::get('/what-if', [WhatIfController::class, 'index']);
    Route::get('/what-if/kuota', [WhatIfController::class, 'kuota']);
    Route::post('/what-if/predict', [WhatIfController::class, 'predict']);
    Route::get('/what-if/{id}', [WhatIfController::class, 'show']);


    // Ambil semua chart sekaligus (rekomendasi untuk load dashboard)
    Route::get('/chart/dashboard', [ChartController::class, 'dashboard']);

    // Atau ambil per chart jika butuh refresh individual
    Route::get('/chart/revenue',     [ChartController::class, 'revenue']);
    Route::get('/chart/customer',    [ChartController::class, 'customer']);
    Route::get('/chart/top-product', [ChartController::class, 'topProduct']);
});