<?php

require_once __DIR__ . "/../services/UsersService.php";


header("Access-Control-Allow-Origin: *");


Flight::set('users_service', new UsersService());


Flight::route('POST /users', function () {
    $payload = Flight::request()->data;

    $result = Flight::get("users_service")->add_users($payload);

    if ($result === "EXISTS") {
        Flight::json(["success" => false, "message" => "User with this email or mobile number already exists."], 400);
    } else {
        Flight::json(["success" => true, "data" => $result]);
    }
});



Flight::route('GET /users/get', function () {
  
   $data=Flight::get("users_service")->get_users();
    Flight::json($data, 200);
});



Flight::route('DELETE /users/delete/byid', function () {


        $payload = Flight::request()->query['id'];
    $data = Flight::get("users_service")->delete_by_idU($payload);
        Flight::json($data, 200);
    
});

Flight::route('GET /admin/secret-data', function () {
    $user = Flight::get('user');
    if (!$user) {
        Flight::halt(401, json_encode(['message' => 'Unauthorized']));
    }

    $userId = $user->user->id; 

    $role = Flight::get('users_service')->get_user_role_by_id($userId);

    if ($role !== 'admin') {
        Flight::halt(403, json_encode(['message' => 'Access denied. Admins only']));
    }

    $secretData = [
        'message' => 'Z'
    ];

    Flight::json($secretData);
});





