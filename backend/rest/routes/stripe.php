<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use \Stripe\Stripe;
use \Stripe\PaymentIntent;

$stripeSecretKey = getenv('STRIPE_SECRET_KEY');

Flight::route('POST /stripe/create-payment-intent', function() use ($stripeSecretKey) {
    $input = json_decode(file_get_contents('php://input'), true);

    $amount = $input['amount'];

    Stripe::setApiKey($stripeSecretKey);

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
