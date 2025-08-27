<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\CanvasController;
use App\Http\Controllers\Api\V1\NodeController;
use App\Http\Controllers\Api\V1\EdgeController;
use App\Http\Controllers\Api\V1\SnapshotController;
use App\Http\Controllers\Api\V1\AnalyzeController;

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => ['status' => 'ok']);

    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('canvases', CanvasController::class);

    // Graph endpoints
    Route::get('canvases/{canvas}/graph', [CanvasController::class, 'getGraph']);
    Route::put('canvases/{canvas}/graph', [CanvasController::class, 'updateGraph']);

    // Nodes & edges
    Route::apiResource('nodes', NodeController::class)->only(['store', 'show', 'update', 'destroy']);
    Route::apiResource('edges', EdgeController::class)->only(['store', 'show', 'update', 'destroy']);

    // Snapshots nested under canvas
    Route::get('canvases/{canvas}/snapshots', [SnapshotController::class, 'index']);
    Route::post('canvases/{canvas}/snapshots', [SnapshotController::class, 'store']);
    Route::get('canvases/{canvas}/snapshots/{snapshot}', [SnapshotController::class, 'show']);
    Route::post('canvases/{canvas}/snapshots/{snapshot}/restore', [SnapshotController::class, 'restore']);

    // Analyze (Gemini)
    Route::post('analyze', [AnalyzeController::class, 'analyze']);
});
