<?php

require_once __DIR__ . "/../services/AuthService.php";
header("Access-Control-Allow-Origin: *");

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

Flight::set('auth_service', new Auth_Service());

Flight::route('POST /login', function () {
    $payload = Flight::request()->data;

    $authService = Flight::get('auth_service');
    $loginResult = $authService->login_user($payload['email'], $payload['password']);

    Flight::json($loginResult);
});


Flight::route('POST /change-password', function () {
    try {
        $authHeader = Flight::request()->getHeader("Authorization");
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            Flight::halt(401, "Missing or invalid Authorization header");
        }

        $token = $matches[1];
        $decoded_token = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        $userId = $decoded_token->user->id ?? null;

        if (!$userId) {
            Flight::halt(401, "Invalid token: user ID missing");
        }

        $input = json_decode(file_get_contents("php://input"), true);
        if (!isset($input['newPassword'])) {
            Flight::json(['error' => 'Missing newPassword'], 400);
            return;
        }

        $authService = Flight::get('auth_service');
        $result = $authService->change_user_password($userId, $input['newPassword']);

        if ($result['success']) {
            Flight::json(['message' => $result['message']]);
        } else {
            Flight::json(['error' => $result['message']], 500);
        }

    } catch (\Exception $e) {
        Flight::halt(401, "Unauthorized: " . $e->getMessage());
    }
});


Flight::route('GET /user/editme', function() {
    try {
        $authHeader = Flight::request()->getHeader("Authorization");
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            Flight::halt(401, "Missing or invalid Authorization header");
        }

        $token = $matches[1];

        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        $userId = $decoded->user->id;

        $authService = Flight::get('auth_service');
        $user = $authService->get_user_by_id($userId);

        Flight::json(['user' => $user]);
    } catch (\Exception $e) {
        Flight::halt(401, "Invalid token: " . $e->getMessage());
    }
});

Flight::route('POST /user/update', function () {
    try {
        $authHeader = Flight::request()->getHeader("Authorization");
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            Flight::halt(401, "Missing or invalid Authorization header");
        }

        $token = $matches[1];

        $decoded_token = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        $userId = $decoded_token->user->id ?? null;

        if (!$userId) {
            Flight::halt(401, "Invalid token: user ID missing");
        }

        $payload = Flight::request()->data->getData();
        if (empty($payload)) {
            Flight::json(['error' => 'Missing data'], 400);
            return;
        }

        $authService = Flight::get('auth_service');
        $result = $authService->update_user($userId, $payload);

        if ($result['success']) {
            Flight::json(['message' => $result['message']]);
        } else {
            Flight::json(['error' => $result['message']], 400);
        }

    } catch (\Exception $e) {
        Flight::halt(401, "Unauthorized: " . $e->getMessage());
    }
});



