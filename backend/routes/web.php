<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestWebSocketController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-websocket', [TestWebSocketController::class, 'sendTestMessage']);
Route::post('/test-websocket', [TestWebSocketController::class, 'receiveFromFrontend']);
Route::get('/whiteboard-test', function () {
    return view('whiteboard-test');
});
