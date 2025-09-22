<?php


require_once __DIR__ . "/../dao/UsersDao.php";

class UsersService {

    private $users_dao;

    public function __construct()
    {
        $this->users_dao=new UsersDao();
    }


    public function add_users($user){
        $exists = $this->users_dao->user_exists($user['email'], $user['mobilenumber']);
          if ($exists) {
        return "EXISTS";
    }

        return $this->users_dao->add_users($user);
    }

    
public function get_users(){

        return $this->users_dao->get_users();
    }

    public function delete_by_idU($id){
        return $this->users_dao->delete_by_idU($id);

    }


      public function get_user_role_by_id($id) {
        return $this->users_dao->get_user_role_by_id($id);
    }



}