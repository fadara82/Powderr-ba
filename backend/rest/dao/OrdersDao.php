<?php


header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/BaseDao.php";
require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


class OrdersDao extends BaseDao {
    public function __construct() {
        parent::__construct('orders');
    }



public function add_orders($order) {
    $sql = "INSERT INTO orders 
            (first_name, last_name, email, mobile_number, city, address, total_price, product_description, product_names) 
            VALUES 
            (:first_name, :last_name, :email, :mobile_number, :city, :address, :total_price, :product_description, :product_names)";

    try {
        $statement = $this->connection->prepare($sql);
        $statement->bindValue(':first_name', $order['firstName']);
        $statement->bindValue(':last_name', $order['lastName']);
        $statement->bindValue(':email', $order['email']);
        $statement->bindValue(':mobile_number', $order['mobilenumber']);
        $statement->bindValue(':city', $order['city']);
        $statement->bindValue(':address', $order['address']);
        $statement->bindValue(':total_price', $order['total_price']);
        $statement->bindValue(':product_description', $order['product_description']);
        $statement->bindValue(':product_names', $order['product_names']);  

        $statement->execute();

        // Poziv email funkcije
        $this->sendConfirmationEmail(
            $order['email'],
            $order['firstName'],
            $order['product_description'],
            $order['product_names'],
            $order['total_price']
        );

        return $order;  
    } catch (PDOException $e) {
        error_log('Error adding order: ' . $e->getMessage());
        throw new Exception('Failed to add order');
    }
}

private function sendConfirmationEmail($toEmail, $toName, $productDescription, $productNames, $totalPrice) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'powderbashop@gmail.com'; 
        $mail->Password   = 'lboc shsuetwzyfvl';   // app password
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->setFrom('powderbashop@gmail.com', 'Powder.Ba Mailer');
        $mail->addAddress($toEmail, $toName);

        $mail->isHTML(true);
        $mail->Subject = 'Order Confirmation';

        $mail->Body = "
            Dear $toName,<br><br>
            Your order has been successfully placed! 🎉<br><br>
            <strong>Order details:</strong><br>
            Product name(s): $productNames <br>
            Description(s): $productDescription <br>
            Total price: $totalPrice KM <br><br>
            Your package should arrive within <strong>48-72 hours</strong>.<br><br>
            Thank you for shopping with us!<br>
            Best regards,<br>
            Powder.Ba Team
        ";

        $mail->send();
    } catch (Exception $e) {
        error_log("Email not sent. Error: {$mail->ErrorInfo}");
    }
}






 public function get_orders(){
    $sql = "SELECT * FROM orders";
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

  public function delete_byidO($id) {
        $sql = "DELETE FROM orders WHERE id = :id";
        try {
            $statement = $this->connection->prepare($sql);
            $statement->bindParam(':id', $id, PDO::PARAM_INT);
            $statement->execute();
            return $statement->rowCount() > 0; // true ako je obrisano
        } catch (PDOException $e) {
            error_log('Error deleting order: ' . $e->getMessage());
            throw new Exception('Failed to delete order');
        }
    }


 public function update_byidO($id) {
        try {
            $stmt = $this->connection->prepare("SELECT * FROM orders WHERE id = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                throw new Exception("Order not found");
            }

            $sql = "UPDATE orders SET status = 'SENT' WHERE id = :id";
            $statement = $this->connection->prepare($sql);
            $statement->bindParam(':id', $id, PDO::PARAM_INT);
            $statement->execute();

            $this->sendSentEmail(
                $order['email'], 
                $order['first_name'], 
                $order['product_description'], 
                $order['total_price']
            );

            return $order;

        } catch (PDOException $e) {
            error_log('Error updating order: ' . $e->getMessage());
            throw new Exception('Failed to update order');
        }
    }

private function sendSentEmail($toEmail, $toName, $productDescription, $totalPrice) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'powderbashop@gmail.com'; 
        $mail->Password   = 'lboc shsuetwzyfvl';   
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->setFrom('powderbashop@gmail.com', 'Powder.Ba Mailer');
        $mail->addAddress($toEmail, $toName);

        $mail->isHTML(true);
        $mail->Subject = 'Your order has been sent! It will arrive within 24–48 hours.';

        $mail->Body = "
            Dear $toName,<br><br>
            Your order has been <strong>sent</strong>! 📦<br><br>
            <strong>Order details:</strong><br>
            Product(s): $productDescription <br>
            Total price: $totalPrice KM <br><br>
            Your package should arrive within <strong>48-72 hours</strong>.<br><br>
            Thank you for shopping with us!<br>
            Best regards,<br>
            Powder.Ba Team
        ";

        $mail->send();
    } catch (Exception $e) {
        error_log("Email not sent. Error: {$mail->ErrorInfo}");
    }
}


public function update_byidB($id){
    $sql = "UPDATE orders SET status = 'Ordered' WHERE id = :id";
    try {
        $statement = $this->connection->prepare($sql);
        $statement->bindParam(':id', $id, PDO::PARAM_INT);
        $statement->execute();

        return $statement->rowCount() > 0;
    } catch (PDOException $e) {
        error_log('Error updating order (Back): ' . $e->getMessage());
        throw new Exception('Failed to update order (Back)');
    }
}

}


?>