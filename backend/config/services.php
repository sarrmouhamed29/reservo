<?php

return [
    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'paydunya' => [
        'master_key' => env('PAYDUNYA_MASTER_KEY'),
        'private_key' => env('PAYDUNYA_PRIVATE_KEY'),
        'public_key' => env('PAYDUNYA_PUBLIC_KEY'),
        'token' => env('PAYDUNYA_TOKEN'),
        'mode' => env('PAYDUNYA_MODE', 'test'),
    ],
];
