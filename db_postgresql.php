<?php
include 'config.php';

// Conexión a PostgreSQL
function connectPostgreSQL() {

    $conn = pg_connect("host=".DB_HOST." port=".DB_PORT_PG." dbname=".DB_NAME_PG." user=".DB_USER_PG." password=".DB_PASS_PG);

    // Comprobar conexión
    if (!$conn) {
        die("Conexión fallida: " . pg_last_error());
    }
    return $conn;
}

// Función para obtener datos del CV desde PostgreSQL
function getCVInfoPostgreSQL($conn) {
    $query = "SELECT * FROM cv_info LIMIT 1";
    $result = pg_query($conn, $query);
    if (pg_num_rows($result) > 0) {
        return pg_fetch_assoc($result);
    } else {
        return null;
    }
}
?>
