<?php
// Database connection
require_once 'db_connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are accepted'
    ]);
    exit;
}

$email = $_POST['email'] ?? '';
$newPassword = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirm_password'] ?? '';
$token = $_POST['token'] ?? ''; 

$errors = [];

if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format';
}

if (empty($newPassword)) {
    $errors[] = 'New password is required';
} elseif (strlen($newPassword) < 6) {
    $errors[] = 'Password must be at least 6 characters long';
}

if ($newPassword !== $confirmPassword) {
    $errors[] = 'Passwords do not match';
}



if (!empty($errors)) {
    echo json_encode([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $errors
    ]);
    exit;
}

// Check if the user exists
$stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email address.'
    ]);
    exit;
}

// User exists, update their password
$user = $result->fetch_assoc();
$userId = $user['user_id'];

// Hash the new password
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Update the password in the database
$updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
$updateStmt->bind_param("si", $hashedPassword, $userId);

if ($updateStmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Your password has been successfully reset. You can now log in with your new password.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while resetting your password. Please try again.'
    ]);
}

// Close connection
$conn->close();
?> 