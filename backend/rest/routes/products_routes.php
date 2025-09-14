<?php

require_once __DIR__ . "/../services/ProductsService.php";

header("Access-Control-Allow-Origin: *");

Flight::set('products_service', new ProductsService());

Flight::route('POST /products', function () {
  

 
       $payload = Flight::request()->data;    
   Flight::get("products_service")->add_products($payload);
});


Flight::route('GET /products/get', function () {

    
        $data = Flight::get("products_service")->get_products();
        Flight::json($data, 200);
    
});

Flight::route('GET /products/get/proteini', function () {


 
        $data = Flight::get("products_service")->get_protein();
        Flight::json($data, 200);
    
});

Flight::route('GET /products/get/vitamini', function () {



        $data = Flight::get("products_service")->get_vitamini();
        Flight::json($data, 200);
    
});

Flight::route('GET /products/get/creatine', function () {

        $data = Flight::get("products_service")->get_creatine();
        Flight::json($data, 200);
    
});


Flight::route('GET /products/get/healthybar', function () {


        $data = Flight::get("products_service")->get_healthybars();
        Flight::json($data, 200);
    
});


Flight::route('GET /products/get/byid', function () {

    $payload = Flight::request()->query['id'];
    $data = Flight::get("products_service")->get_byid($payload);
        Flight::json($data, 200);
    
});







Flight::route('DELETE /products/delete/byid', function () {

        $payload = Flight::request()->query['id'];
    $data = Flight::get("products_service")->delete_byid($payload);
        Flight::json($data, 200);
    
});


Flight::route('GET /products/get/cart', function () {

        $data = Flight::get("products_service")->getCart();
        Flight::json($data, 200);
    
});





Flight::route('PUT /products/update/@id', function($id){
    $input = file_get_contents('php://input');
    $productData = json_decode($input, true);

    if (!$productData) {
        Flight::json(["status" => "error", "message" => "Invalid JSON input"], 400);
        return;
    }

    try {
        Flight::get("products_service")->updateProductById($id, $productData);
        Flight::json(["status" => "success", "message" => "Product updated"]);
    } catch (Exception $e) {
        Flight::json(["status" => "error", "message" => $e->getMessage()], 500);
    }
});
