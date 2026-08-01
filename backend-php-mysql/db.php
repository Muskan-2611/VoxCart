<?php
// VoxCart Database Connection File
// Connects securely using standard PHP Data Objects (PDO)

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$db_name = 'voxcart_db';
$username = 'root';
$password = ''; // Set your actual XAMPP / MySQL root password here

// Gemini API Key for Multimodal AI Voice OCR Receipt scanner
$gemini_api_key = 'AIzaSyC-MZt8NSdDPpa_j3_HRCY63cIzFNbsjHY'; // Paste your Gemini API key here (e.g. 'AIzaSy...') or configure in .env file

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    // Set query attributes to fail fast and cast datatypes natively
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database Connection Failed",
        "details" => $e->getMessage()
    ]);
    exit();
}
?>
