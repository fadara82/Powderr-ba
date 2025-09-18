<?php

header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/BaseDao.php";

class ProductsDao extends BaseDao{

public function __construct(){
    parent::__construct("products");
}


    public function add_products($product) {
    $sql = "INSERT INTO products (productImg, productName, flavour, price, description, category,quantity) 
            VALUES (:productImg, :productName, :flavour, :price, :description, :category,:quantity)";

    try {
        $statement = $this->connection->prepare($sql);

        $statement->bindValue(':productImg', $product['productImg']);
        $statement->bindValue(':productName', $product['productName']);
        $statement->bindValue(':flavour', $product['flavour']);
        $statement->bindValue(':price', $product['price']);
        $statement->bindValue(':description', $product['description']);
        $statement->bindValue(':category', $product['category']);
    $statement->bindValue(':quantity', $product['quantity']);

        $statement->execute();

        return $product;
    } catch (PDOException $e) {
        error_log('Error adding product: ' . $e->getMessage());
        throw new Exception('Failed to add product');
    }
}
    
     public function get_products(){
    $sql = "SELECT * FROM products";
    try {
        $statement = $this->connection->prepare($sql);
        
        $statement->execute();
        
        $orders = $statement->fetchAll(PDO::FETCH_ASSOC);
        
        return $orders;
    } catch (PDOException $e) {
        error_log('Error getting orders: ' . $e->getMessage());
        throw new Exception('Failed to get orders');
    }
}
 

public function get_protein(){
    $sql = "SELECT * FROM products WHERE category = 'Proteini'";
    try {
        $statement = $this->connection->prepare($sql);
        
        $statement->execute();
        
        $products = $statement->fetchAll(PDO::FETCH_ASSOC);
        
        return $products;
    } catch (PDOException $e) {
        error_log('Error getting protein products: ' . $e->getMessage());
        throw new Exception('Failed to get protein products');
    }
}


public function get_vitamini(){
    $sql = "SELECT * FROM products WHERE category = 'Vitamini'";
    try {
        $statement = $this->connection->prepare($sql);
        
        $statement->execute();
        
        $products = $statement->fetchAll(PDO::FETCH_ASSOC);
        
        return $products;
    } catch (PDOException $e) {
        error_log('Error getting protein products: ' . $e->getMessage());
        throw new Exception('Failed to get protein products');
    }
}
public function get_creatine(){
    $sql = "SELECT * FROM products WHERE category = 'Creatine'";
    try {
        $statement = $this->connection->prepare($sql);
        
        $statement->execute();
        
        $products = $statement->fetchAll(PDO::FETCH_ASSOC);
        
        return $products;
    } catch (PDOException $e) {
        error_log('Error getting protein products: ' . $e->getMessage());
        throw new Exception('Failed to get protein products');
    }
}
public function get_healthybars(){
    $sql = "SELECT * FROM products WHERE category = 'Cokoladice'";
    try {
        $statement = $this->connection->prepare($sql);
        
        $statement->execute();
        
        $products = $statement->fetchAll(PDO::FETCH_ASSOC);
        
        return $products;
    } catch (PDOException $e) {
        error_log('Error getting protein products: ' . $e->getMessage());
        throw new Exception('Failed to get protein products');
    }
}
/*
public function get_byid($id){
    $sql = "SELECT * FROM products WHERE id = :id";
    try {
        $statement = $this->connection->prepare($sql);
        $statement->bindParam(':id', $id, PDO::PARAM_INT);
        $statement->execute();
        $product = $statement->fetch(PDO::FETCH_ASSOC); // fetch umjesto fetchAll
        return $product;
    } catch (PDOException $e) {
        error_log('Error getting product by ID: ' . $e->getMessage());
        throw new Exception('Failed to get product by ID');
    }
}
*/

public function get_byid($id){
    $sql = "SELECT * FROM products WHERE id = :id";
    try {
        $statement = $this->connection->prepare($sql);
        $statement->bindParam(':id', $id, PDO::PARAM_INT);
        $statement->execute();
        $product = $statement->fetch(PDO::FETCH_ASSOC);

        if ($product && !empty($product["productImg"])) {
            $decoded = json_decode($product["productImg"], true);
            if ($decoded && is_array($decoded)) {
                $product["images"] = $decoded; 
            } else {
                $product["images"] = [$product["productImg"]];
            }
        } else {
            $product["images"] = [];
        }

        return $product;
    } catch (PDOException $e) {
        error_log('Error getting product by ID: ' . $e->getMessage());
        throw new Exception('Failed to get product by ID');
    }
}



public function delete_by_id($id){
    $sql = "DELETE  FROM products WHERE id = :id";
    try {
        $statement = $this->connection->prepare($sql);
        
        $statement->bindParam(':id', $id, PDO::PARAM_INT);
        
        $statement->execute();
        
        $products = $statement->fetchAll(PDO::FETCH_ASSOC);
        
        return $products;
    } catch (PDOException $e) {
        error_log('Error getting product by ID: ' . $e->getMessage());
        throw new Exception('Failed to get product by ID');
    }
}



public function deleteCart($id){
    $sql = "UPDATE products SET status = 'N' WHERE id = :id";
;
    try {
        $statement = $this->connection->prepare($sql);
        
        $statement->bindParam(':id', $id, PDO::PARAM_INT);
        
        $statement->execute();
        
        $products = $statement->fetchAll(PDO::FETCH_ASSOC);
        
        return $products;
    } catch (PDOException $e) {
        error_log('Error getting product by ID: ' . $e->getMessage());
        throw new Exception('Failed to get product by ID');
    }
}


public function getCart(){
    $sql = "SELECT * FROM products WHERE status = 'Y'";
    try {
        $statement = $this->connection->prepare($sql);
        
        $statement->execute();
        
        $products = $statement->fetchAll(PDO::FETCH_ASSOC);
        
        return $products;
    } catch (PDOException $e) {
        error_log('Error getting protein products: ' . $e->getMessage());
        throw new Exception('Failed to get protein products');
    }
}

public function updateProductById($id, $product) {
    $sql = "UPDATE products SET
                productImg = :productImg,
                productName = :productName,
                flavour = :flavour,
                price = :price,
                description = :description,
                category = :category
            WHERE id = :id";

    try {
        $stmt = $this->connection->prepare($sql);

        $stmt->bindValue(':productImg', $product['image']);
        $stmt->bindValue(':productName', $product['productName']);
        $stmt->bindValue(':flavour', $product['flavour']);
        $stmt->bindValue(':price', $product['price']);
        $stmt->bindValue(':description', $product['desc']);
        $stmt->bindValue(':category', $product['category']);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        $stmt->execute();

        return true;
    } catch (PDOException $e) {
        error_log("Error updating product: " . $e->getMessage());
        throw new Exception("Database update failed");
    }
}




 }





