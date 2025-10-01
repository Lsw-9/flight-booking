<?php
// Database configuration
$servername = "localhost";  // MySQL server
$username = "root";         // Default username
$password = "";             // Default password
$dbname = "flightb_db";     // Database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set character set
$conn->set_charset("utf8mb4");
?> 