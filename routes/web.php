<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('editor');
});
//Api routes
Route::post('/heatpoints', [\App\Http\Controllers\MapController::class,'createCoordinate']);
Route::post('/heatpoints/delete/{id}', [\App\Http\Controllers\MapController::class,'deleteCoordinate']);
Route::post('/heatpoints/update/{id}', [\App\Http\Controllers\MapController::class,'updateCoordinate']);
Route::get('/heatpoints', [\App\Http\Controllers\MapController::class,'getCoordinatesWithinBoundingBox']);
Route::get('/ways', [\App\Http\Controllers\MapController::class,'getWaysWithinBoundingBox']);


Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth'])->name('dashboard');

require __DIR__.'/auth.php';
