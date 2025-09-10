
<?php

use Firebase\JWT\JWT;
use Firebase\JWT\key;

/*

Flight::route("/*",function(){ 
    if(strpos(Flight::request()->url,'/login')===0 ||
    strpos(Flight::request()->url,'/users')===0 )
    {
        return true;
    }
    else{
 try {
            $token = Flight::request()->getHeader("Authentication");
            if(!$token)
                Flight::halt(401, "Missing authentication header");

            $decoded_token = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
            
            
            Flight::set('user',$decoded_token->user);
             Flight::set('jwt_token',$token);

           return true;
        } catch (\Exception $e) {
            Flight::halt(401, $e->getMessage());
        }
         }

});

*/


Flight::route("/*", function () {
    $url = Flight::request()->url;

    // Dozvoli pristup login i registration bez tokena
    if (
        strpos($url, '/login') === 0 ||
        strpos($url, '/registration') === 0 ||
        strpos($url, '/products/get') === 0 ||
        strpos($url, '/users') === 0 ||
          strpos($url, '/orders') === 0 

        
    ) {
        return true;
    }

    // Za ostale rute token je obavezan
    $token = Flight::request()->getHeader("Authentication");
    if (!$token) {
        Flight::halt(401, json_encode(["message" => "Missing authentication header"]));
    }

    try {
        $decoded_token = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        Flight::set('jwt_token', $token);
        Flight::set('user', $decoded_token); // cijeli payload tokena, uključujući role itd.
    } catch (\Exception $e) {
        Flight::halt(401, json_encode(["message" => "Invalid token: " . $e->getMessage()]));
    }

    return true;
});
