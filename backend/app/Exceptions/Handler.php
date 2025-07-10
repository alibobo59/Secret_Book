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
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    public function render($request, Throwable $exception)
    {
        if ($request->is('api/*') && $exception instanceof InvalidRouteException) {
            return response()->json(['message' => 'Route not found.'], 404);
        }

        return parent::render($request, $exception);
    }
}
