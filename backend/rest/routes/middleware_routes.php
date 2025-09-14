<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

Flight::route("/*", function () {
    $url = Flight::request()->url;
    $method = $_SERVER['REQUEST_METHOD'] ?? '';

    if ($method === 'OPTIONS') {
        return true;
    }

    if (
        strpos($url, '/login') === 0 ||
        strpos($url, '/registration') === 0 ||
        strpos($url, '/products/get') === 0 ||
        strpos($url, '/users') === 0 ||
        strpos($url, '/orders') === 0
    ) {
        return true;
    }

    $authHeader = Flight::request()->getHeader("Authorization");
    $token = null;

    if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    }

    if (!$token) {
        Flight::halt(401, json_encode(["message" => "Missing or invalid Authorization header"]));
    }

   

    try {
    $decoded_token = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
    Flight::set('jwt_token', $token);
    Flight::set('user', $decoded_token->user); 
} catch (\Exception $e) {
    Flight::halt(401, json_encode(["message" => "Invalid token: " . $e->getMessage()]));
}

    return true;
});
