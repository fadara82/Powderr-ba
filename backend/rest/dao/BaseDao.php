<?php
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/../../vendor/autoload.php";

class BaseDao {
    protected $connection;
    private $table;

    public function __construct($table) {
        $this->table = $table;

        // Učitaj db.env
        $env = parse_ini_file(__DIR__ . './db.env');

        $dbName = $env['DB_NAME'] ?? '';
        $dbUser = $env['DB_USER'] ?? '';
        $dbPort = $env['DB_PORT'] ?? 3306;
        $dbPass = $env['DB_PASSWORD'] ?? '';
        $dbHost = $env['DB_HOST'] ?? '127.0.0.1';

        try {
            // Establish PDO database connection
            $this->connection = new PDO(
                "mysql:host={$dbHost};dbname={$dbName};port={$dbPort}",
                $dbUser,
                $dbPass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (PDOException $e) {
            throw $e;
        }
    }

    public function getTable() {
        return $this->table;
    }
}
