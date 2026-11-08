<?php

namespace App\Http\Controllers\PayDunya;

use App\Actions\Payments\HandlePayDunyaIpnAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WebhookController extends Controller
{
    public function __invoke(Request $request, HandlePayDunyaIpnAction $action): Response
    {
        $token = $request->input('data.invoice.token');

        if (! $token) {
            return response('Missing token.', 400);
        }

        $action->execute($token);

        return response('OK', 200);
    }
}
