<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Definir el directorio donde se guardarán las imágenes
    $targetDir = "img/"; 
    
    // Verificar si la carpeta existe y tiene permisos de escritura
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    $file = $_FILES['image']; // Obtener el archivo subido
    $fileName = basename($file["name"]); // Obtener el nombre del archivo
    $targetFile = $targetDir . uniqid() . "_" . $fileName; // Crear un nombre único para el archivo

    // Verificar si la carga fue exitosa
    if (move_uploaded_file($file["tmp_name"], $targetFile)) {
        // Retornar la URL de la imagen cargada (puedes agregarla a la lista de imágenes)
        echo $targetFile;
    } else {
        http_response_code(500);
        echo "Error al subir la imagen.";
    }
}
?>
