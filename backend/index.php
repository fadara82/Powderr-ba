<?php

require_once "vendor/autoload.php";
require "rest/routes/middleware_routes.php";
require "rest/routes/orders_routes.php";
require "rest/routes/products_routes.php";
require "rest/routes/users_routes.php";
require "rest/routes/auth_routes.php";
require 'rest/routes/stripe.php';


Flight::route('/', function () {
  echo 'hello world!';
});

Flight::route('/web', function () {
  echo 'hello world sa Malte!';
});

error_reporting(E_ALL);
ini_set('display_errors', 1);

Flight::map('error', function(Throwable $ex) {
    Flight::halt(500, $ex->getMessage());
});


Flight::start();