<?php
// Database connection and auth helper
require_once 'db_connection.php';
require_once 'user_auth.php';

// Set content type
header('Content-Type: application/json');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

// Check if user is logged in
if (isLoggedIn()) {
    // Get user data
    $user = getCurrentUser();
    
    if ($user) {

        unset($user['password']);
        
        echo json_encode([
            'success' => true,
            'isLoggedIn' => true,
            'user' => $user
        ]);
    } else {
        // User ID in session but not found in database
        echo json_encode([
            'success' => true,
            'isLoggedIn' => false,
            'message' => 'Session exists but user not found'
        ]);
        
        logoutUser();
    }
} else {

    echo json_encode([
        'success' => true,
        'isLoggedIn' => false
    ]);
}

$conn->close();
?> 