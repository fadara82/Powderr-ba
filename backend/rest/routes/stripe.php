<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use \Stripe\Stripe;
use \Stripe\PaymentIntent;

// Učitaj stripe.env
$env = parse_ini_file(__DIR__ . '/stripe.env');
$stripeSecretKey = $env['STRIPE_SECRET_KEY'] ?? null;

Flight::route('POST /stripe/create-payment-intent', function() use ($stripeSecretKey) {
    $input = json_decode(file_get_contents('php://input'), true);

    $amount = $input['amount']; // amount u centima (npr. 1000 = 10.00 KM)

    Stripe::setApiKey($stripeSecretKey); // sad ide iz env fajla

    try {
        $paymentIntent = PaymentIntent::create([
            'amount' => $amount,
            'currency' => 'eur', 
        ]);

        Flight::json(['clientSecret' => $paymentIntent->client_secret]);
    } catch (Exception $e) {
        Flight::halt(500, json_encode(['error' => $e->getMessage()]));
    }
});
