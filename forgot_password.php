<?php
// Database connection
require_once 'db_connection.php';

// Set response content type to JSON
header('Content-Type: application/json');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are accepted'
    ]);
    exit;
}

// Get POST data
$email = $_POST['email'] ?? '';

// Validate input
$errors = [];

if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format';
}

if (!empty($errors)) {
    echo json_encode([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $errors
    ]);
    exit;
}

// For verify if the user exists
$stmt = $conn->prepare("SELECT user_id, email FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {

    echo json_encode([
        'success' => true,
        'message' => 'If your email address exists in our database, you will be directed to reset your password shortly.'
    ]);
    exit;
}

error_log("Password reset requested for: $email (DEMO ONLY - no actual email sent)");

echo json_encode([
    'success' => true,
    'message' => 'If your email address exists in our database, you will be directed to reset your password shortly.'
]);

$conn->close();
?> 