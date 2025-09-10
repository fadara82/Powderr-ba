<?php


require_once __DIR__ ."/../dao/ProductsDao.php";

class ProductsService{
    private $product_dao;

   public function __construct(){
    $this->product_dao= new ProductsDao();
   }

   public function add_products($product){
    return $this->product_dao->add_products($product);
   }


   public function get_products(){
        return $this->product_dao->get_products();
    }

    
   public function get_protein(){
        return $this->product_dao->get_protein();
    }


    public function get_vitamini(){
        return $this->product_dao->get_vitamini();
    }
   
     public function get_creatine(){
        return $this->product_dao->get_creatine();
    }

    public function get_healthybars(){
        return $this->product_dao->get_healthybars();
    }

    public function get_byid($id){
        return $this->product_dao->get_byid($id);

    }
     public function getCart(){
        return $this->product_dao->getCart();

    }

    public function delete_byid($id){
        return $this->product_dao->delete_by_id($id);

    }

<<<<<<< HEAD


public function updateProductById($id, $product) {
    return $this->product_dao->updateProductById($id, $product);
}


=======
//      public function updatep_byid($id,$product){
//     return $this->product_dao->updatep_byid($id,$product);
//    }

  public function updateCart($id){
    return $this->product_dao->updateCart($id);
 }
>>>>>>> 392c69f97ccb183cdd6bbedbf6993937388ff759
   public function deleteCart($id){
    return $this->product_dao->deleteCart($id);
 }
}