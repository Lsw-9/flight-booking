<?php
require_once 'user_auth.php';

header('Content-Type: application/json');

logoutUser();

echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
?> 