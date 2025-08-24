<?php
namespace App\Exceptions;

use Throwable;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Routing\Exceptions\InvalidRouteException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        // Dòng 13
        return response()->json(['message' => 'Chưa xác thực.'], 401);
        
        // Dòng 19
        return response()->json(['message' => 'Không tìm thấy đường dẫn.'], 404);
    }

    public function render($request, Throwable $exception)
    {
        if ($request->is('api/*') && $exception instanceof InvalidRouteException) {
            return response()->json(['message' => 'Route not found.'], 404);
        }

        return parent::render($request, $exception);
    }
}
