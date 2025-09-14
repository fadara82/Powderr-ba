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

    if ($loginResult !== false) {
        Flight::json(['message' => 'Successfully logged in', 'data' => $loginResult]);
    } else {
        Flight::json(['error' => 'Login failed'], 401);
    }
});

Flight::route('POST /change-password', function () {
    $payload = Flight::request()->data;

    $authService = Flight::get('auth_service');

    // Ovdje očekujemo da payload sadrži 'userId' i 'newPassword'
    if (!isset($payload['userId']) || !isset($payload['newPassword'])) {
        Flight::json(['error' => 'Missing parameters'], 400);
        return;
    }

    $result = $authService->change_user_password($payload['userId'], $payload['newPassword']);

    if ($result['success']) {
        Flight::json(['message' => $result['message']]);
    } else {
        Flight::json(['error' => $result['message']], 500);
    }
});




/**
     * @OA\Post(
     *      path="/login/",
     *      tags={"users"},
     *      summary="Login Users",
     *      @OA\Response(
     *           response=200,
     *           description="Users Login Data"
     *      ),
     * * security={
     *          {"ApiKey": {}}   
     *      },
     *      @OA\RequestBody(
     *          description="Login Payload",
     *          @OA\JsonContent(
     *              required={"email","password"},
     *              @OA\Property(property="email", type="string", example="1", description="User email"),
     *              @OA\Property(property="password", type="string", example="1234", description="User password"),


     *          )
     *      )
     * )
     */

  
        /**
     * @OA\Post(
     *      path="/logout",
     *      tags={"auth"},
     *      summary="Logout from the system",
     *      security={
     *          {"ApiKey": {}}   
     *      },
     *      @OA\Response(
     *           response=200,
     *           description="Success response or exception if unable to verify jwt token"
     *      ),
     * )
     */
Flight::route('POST /change-password', function () {
    try {
        $authHeader = Flight::request()->getHeader("Authorization");
        if (!$authHeader) {
            Flight::halt(401, "Missing Authorization header");
        }

        $token = str_replace("Bearer ", "", $authHeader);

        $decoded_token = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        $userId = $decoded_token->user->id ?? null;

        if (!$userId) {
            Flight::halt(401, "Invalid token: user ID missing");
        }

        $payload = Flight::request()->data;
        if (!isset($payload['newPassword'])) {
            Flight::json(['error' => 'Missing newPassword'], 400);
            return;
        }

        $authService = Flight::get('auth_service');
        $result = $authService->change_user_password($userId, $payload['newPassword']);

        if ($result['success']) {
            Flight::json(['message' => $result['message']]);
        } else {
            Flight::json(['error' => $result['message']], 500);
        }

    } catch (\Exception $e) {
        Flight::halt(401, $e->getMessage());
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



