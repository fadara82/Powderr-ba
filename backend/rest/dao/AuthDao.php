<?php

require_once __DIR__ . "/BaseDao.php";

use Firebase\JWT\JWT;

class AuthDao extends BaseDao {

    public function __construct() {
        parent::__construct("users");
    }

    // LOGIN korisnika
    public function login_user($email, $password) {
        try {
            $query = "SELECT * FROM users WHERE email = :email";
            $stmt = $this->connection->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                unset($user['password']); // ukloni šifru iz podataka

                $jwt_payload = [
                    'user' => $user,
                    'iat' => time(),
                    'exp' => time() + (60 * 60 * 24) // token važi 24h
                ];

                $jwt_token = JWT::encode($jwt_payload, JWT_SECRET, 'HS256');

                return [
                    'success' => true,
                    'token'   => $jwt_token,
                    'user'    => $user
                ];
            }

            return [
                'success' => false,
                'message' => 'Invalid email or password'
            ];

        } catch (PDOException $e) {
            error_log("Login error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Login failed'
            ];
        }
    }

    public function change_user_password($userId, $newPassword) {
        $sql = "UPDATE users SET password = :password WHERE id = :userId";

        try {
            $hashed_password = password_hash($newPassword, PASSWORD_DEFAULT);

            $statement = $this->connection->prepare($sql);
            $statement->bindValue(':password', $hashed_password);
            $statement->bindValue(':userId', $userId, PDO::PARAM_INT);
            $statement->execute();

            if ($statement->rowCount() > 0) {
                return [
                    'success' => true,
                    'message' => 'Password successfully changed'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'User not found or password unchanged'
                ];
            }

        } catch (PDOException $e) {
            error_log('Error changing password: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to change password'
            ];
        }
    }

    // GET USER BY ID
    public function get_user_by_id($userId) {
        try {
            $query = "SELECT id, first_name, last_name, email, mobile_number 
                      FROM users WHERE id = :userId";
            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            error_log("Error fetching user: " . $e->getMessage());
            return false;
        }
    }

    // UPDATE USER
    public function update_user($userId, $data) {
        try {
            $sql = "UPDATE users 
                    SET first_name = :first_name, 
                        last_name = :last_name, 
                        email = :email, 
                        mobile_number = :mobile_number 
                    WHERE id = :userId";

            $stmt = $this->connection->prepare($sql);
            $stmt->bindValue(':first_name', $data['first_name']);
            $stmt->bindValue(':last_name', $data['last_name']);
            $stmt->bindValue(':email', $data['email']);
            $stmt->bindValue(':mobile_number', $data['mobile_number']);
            $stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return [
                    'success' => true,
                    'message' => 'User updated successfully'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'No changes made or user not found'
                ];
            }

        } catch (PDOException $e) {
            error_log("Error updating user: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to update user'
            ];
        }
    }
}
