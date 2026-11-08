<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Actions\Auth\RegisterUserAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request, RegisterUserAction $action): JsonResponse
    {
        $user = $action->execute($request->validated());

        Auth::login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return (new UserResource($user))
            ->response()
            ->setStatusCode(201);
    }
}
