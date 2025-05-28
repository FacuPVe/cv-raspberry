<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Incluir configuración
include 'config.php';

function connectDB() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME_MARIA . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER_MARIA, DB_PASS_MARIA, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Conexión fallida: " . $e->getMessage()]);
        exit;
    }
}

// Manejar solicitudes OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Endpoint /getCV
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $pdo = connectDB();
        $stmt = $pdo->query("SELECT * FROM cv_info LIMIT 1");
        $data = $stmt->fetch();
        echo json_encode($data);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al obtener los datos: " . $e->getMessage()]);
    }
}
// Endpoint /updateCV
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $pdo = connectDB();
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar datos requeridos
        $required_fields = ['name', 'profession', 'experience', 'email'];
        foreach ($required_fields as $field) {
            if (!isset($data[$field])) {
                throw new Exception("Campo requerido faltante: " . $field);
            }
        }

        $stmt = $pdo->prepare("UPDATE cv_info SET 
            name = :name, 
            profession = :profession, 
            experience = :experience, 
            email = :email 
            WHERE id = 1");
            
        $stmt->execute([
            ':name' => $data['name'],
            ':profession' => $data['profession'],
            ':experience' => $data['experience'],
            ':email' => $data['email']
        ]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Datos actualizados correctamente"]);
        } else {
            echo json_encode(["success" => false, "message" => "No se encontró el registro para actualizar"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al actualizar los datos: " . $e->getMessage()]);
    }
}
else {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}
?> 