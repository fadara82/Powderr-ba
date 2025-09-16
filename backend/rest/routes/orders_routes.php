<?php

require_once __DIR__ . "/../services/OrdersService.php";

header("Access-Control-Allow-Origin: *");

Flight::set('orders_service', new OrderService());

/*
Flight::route('POST /orders', function () {
    $payload = Flight::request()->data;
         /**
     * @OA\Post(
     *      path="/orders/",
     *      tags={"orders"},
     *      summary="Add orders data to the database",
     * security={
     *          {"ApiKey": {}}   
     *      },
     *      @OA\Response(
     *           response=200,
     *           description="Orders Data"
     *      ),
     *      @OA\RequestBody(
     *          description="Orders data payload",
     *          @OA\JsonContent(
     *              required={"first_name","last_name","email","mobile_number","city","address"},
     *             @OA\Property(property="id", type="string", example="1", description="User ID"),
     *              @OA\Property(property="first_name", type="string", example="Fadi", description="User First Name"),
     *              @OA\Property(property="last_name", type="string", example="Egho", description="User Last Name"),
     *              @OA\Property(property="email", type="string", example="fadi.egho@stu.ibu.edu.ba", description="User email"),
     *              @OA\Property(property="city", type="string", example="Sarajevo", description="City of orderer"),
     *              @OA\Property(property="address", type="string", example="Malta 29", description="Address of orderer"),
     *              @OA\Property(property="status", type="string", example="Ordered", description="Order status"),




     *              

     *          )
     *      )
     * )
     */
    /*
   Flight::get("orders_service")->add_orders($payload);
});
*/
Flight::route('POST /orders', function () {
    // Pretvori payload u asocijativni niz
    $payload = Flight::request()->data->getData();

    $orderData = [
        'fName' => $payload['firstName'] ?? '',
        'lastName' => $payload['lastName'] ?? '',
        'email' => $payload['email'] ?? '',
        'mobilenumber' => $payload['mobilenumber'] ?? '',
        'city' => $payload['city'] ?? '',
        'address' => $payload['address'] ?? '',
        'total_price' => $payload['total_price'] ?? 0,
        'product_description' => $payload['product_description'] ?? '',
    ];

    try {
        $order = Flight::get("orders_service")->add_orders($orderData);

        Flight::json([
            'success' => true,
            'message' => 'Narudžba je dodana i email potvrda poslana!',
            'order' => $order
        ]);
    } catch (Exception $e) {
        Flight::json([
            'success' => false,
            'message' => 'Greška pri dodavanju narudžbe: ' . $e->getMessage()
        ], 500);
    }
});



Flight::route('GET /orders/get', function () {
     /**
 * @OA\Get(
 *      path="/orders/get",
 *      tags={"orders"},
 *      summary="Get all orders",
 * security={
     *          {"ApiKey": {}}   
     *      },
 *      @OA\Response(
 *           response=200,
 *           description="Array of all orders in the databases"
 *      )
 * )
 */
   $data=Flight::get("orders_service")->get_orders();
    Flight::json($data, 200);
});



Flight::route('DELETE /orders/delete/byid', function () {

      /**
     * @OA\Delete(
     *      path="/orders/delete/byid/",
     *      tags={"orders"},
     *      summary="Delete order by id",
     * security={
     *          {"ApiKey": {}}   
     *      },
     *      @OA\Response(
     *           response=200,
     *           description="Deleted order data or 500 status code exception otherwise"
     *      ),
     *      @OA\Parameter(@OA\Schema(type="number"), in="query", name="id", example="1", description="Order ID")
     * )
     */



        $payload = Flight::request()->query['id'];
    $data = Flight::get("orders_service")->delete_byidO($payload);
        Flight::json($data, 200);
    
});



Flight::route('PUT /orders/update/byid', function () {

      
        $payload = Flight::request()->query['id'];
    $data = Flight::get("orders_service")->update_byidO($payload);
        Flight::json($data, 200);
    
});

Flight::route('PUT /orders/update/byidB', function () {
    $id = Flight::request()->query['id'];
    $data = Flight::get("orders_service")->update_byidB($id);
    Flight::json($data, 200);
});

