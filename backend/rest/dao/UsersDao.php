<?php

header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/BaseDao.php";

class UsersDao extends BaseDao{
    public function __construct()
    {
        parent :: __construct("users");
        }

<<<<<<< HEAD
      public function add_users($user) {
    $sql = "INSERT INTO users (first_name, last_name, email, mobile_number, password, role)
            VALUES (:first_name, :last_name, :email, :mobile_number, :password, :role)";

    try {
        // Hash password
        $hashed_password = password_hash($user['password'], PASSWORD_DEFAULT);

        // Default role ako nije postavljena
        $role = $user['role'] ?? 'user'; // ili 'main' ako hoćeš

        $statement = $this->connection->prepare($sql);
        $statement->bindValue(':first_name', $user['fname']);
        $statement->bindValue(':last_name', $user['lname']);
        $statement->bindValue(':email', $user['email']);
        $statement->bindValue(':mobile_number', $user['mobilenumber']);
        $statement->bindValue(':password', $hashed_password);
        $statement->bindValue(':role', $role);

        $statement->execute();
        return $user;

    } catch (PDOException $e) {
        error_log('Error adding user: ' . $e->getMessage());
        throw new Exception('Failed to add user');
    }
}
=======
        public function add_users($user) {
    $sql = "INSERT INTO users(first_name, last_name, email, mobile_number, password)
            VALUES(:first_name, :last_name, :email, :mobile_number, :password)";

    try {
        // Hash the user's password
        $hashed_password = password_hash($user['password'], PASSWORD_DEFAULT);

        $statement = $this->connection->prepare($sql);
        $statement->bindValue(':first_name', $user['fname']);
        $statement->bindValue(':last_name', $user['lname']);
        $statement->bindValue(':email', $user['email']);
        $statement->bindValue(':mobile_number', $user['mobilenumber']);
        $statement->bindValue(':password', $hashed_password);

        $statement->execute();
        return $user;
>>>>>>> 392c69f97ccb183cdd6bbedbf6993937388ff759

    } catch (PDOException $e) {
        error_log('Error adding user: ' . $e->getMessage());
        throw new Exception('Failed to add user');
    }
}

         public function get_users(){
    $sql = "SELECT * FROM users";
    try {
        $statement = $this->connection->prepare($sql);
        
        $statement->execute();
        
        $users = $statement->fetchAll(PDO::FETCH_ASSOC);
        
        return $users;
    } catch (PDOException $e) {
        error_log('Error getting orders: ' . $e->getMessage());
        throw new Exception('Failed to get orders');
    }
}

public function delete_by_idU($id){
    $sql = "DELETE FROM users WHERE id = :id";
    try {
        $statement = $this->connection->prepare($sql);
        $statement->bindParam(':id', $id, PDO::PARAM_INT);
        $statement->execute();
        
        $rowCount = $statement->rowCount(); // koliko redova je obrisano
        return ['deletedRows' => $rowCount];
    } catch (PDOException $e) {
        error_log('Error deleting user by ID: ' . $e->getMessage());
        throw new Exception('Failed to delete user by ID');
    }
}

public function user_exists($email, $mobile_number) {
    $sql = "SELECT * FROM users WHERE email = :email OR mobile_number = :mobile_number";
    $stmt = $this->connection->prepare($sql);
    $stmt->bindValue(':email', $email);
    $stmt->bindValue(':mobile_number', $mobile_number);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC); 
}

public function get_user_role_by_id($id) {
    $sql = "SELECT role FROM users WHERE id = :id";
    try {
        $statement = $this->connection->prepare($sql);
        $statement->bindParam(':id', $id, PDO::PARAM_INT);
        $statement->execute();
        $role = $statement->fetchColumn();
        return $role;  // vraća 'admin', 'user' ili šta već imate
    } catch (PDOException $e) {
        error_log('Error getting user role by ID: ' . $e->getMessage());
        throw new Exception('Failed to get user role by ID');
    }
}

public function get_user_by_id($userId) {
    $sql = "SELECT id, first_name, last_name, email, mobile_number
            FROM users
            WHERE id = :id";
    try {
        $stmt = $this->connection->prepare($sql);
        $stmt->bindValue(':id', $userId);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC); // vraća array sa first_name, last_name, email, mobile_number
    } catch (PDOException $e) {
        error_log("Error fetching user: " . $e->getMessage());
        return null;
    }
}


        
}
