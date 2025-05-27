<?php

// config.php contiene todos los valores de la base de datos
include 'config.php';

// Conexión a MariaDB
function connectMariaDB() {

    $mysqli = new mysqli(DB_HOST, DB_USER_MARIA, DB_PASS_MARIA, DB_NAME_MARIA);

    //Comprobar conexión
    if ($mysqli->connect_error) {
        die("Conexión fallida: " . $mysqli->connect_error);
    }
    return $mysqli;
}

// Función para obtener datos del CV desde MariaDB
function getCVInfoMariaDB($mysqli) {
    $sql = "SELECT * FROM cv_info LIMIT 1";
    $result = $mysqli->query($sql);
    if ($result->num_rows > 0) {
	return $result-> fetch_assoc();
    } else {
	return null;
    }
}

?>
