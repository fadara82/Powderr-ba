<?php

require_once __DIR__ . '/../dao/AuthDao.php';

class Auth_Service {
    private $auth_dao;

    public function __construct() {
        $this->auth_dao = new AuthDao();
    }

    public function login_user($email,$password){
        return $this->auth_dao->login_user($email,$password);
    }

public function change_user_password($userId, $newPassword) {
    return $this->auth_dao->change_user_password($userId, $newPassword);
}
  public function get_user_by_id($userId) {
        return $this->auth_dao->get_user_by_id($userId);
    }

    public function update_user($userId, $data) {
        return $this->auth_dao->update_user($userId, $data);
    }

}