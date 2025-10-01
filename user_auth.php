<?php
// Database connection
require_once 'db_connection.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

/**
 * For check if a user is logged in
 * 
 * @return bool 
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Get current logged in user's data
 * 
 * @return array|null 
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    global $conn;
    
    $userId = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT user_id, first_name, last_name, email, phone, created_at FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        return $result->fetch_assoc();
    }
    
    return null;
}

/**
 * Logout the current user
 */
function logoutUser() {

    $_SESSION = array();
    
    session_destroy();
    
    // Delete the session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
}

/**
 * Register new user
 * 
 * @param string $firstName User's first name
 * @param string $lastName User's last name
 * @param string $email User's email
 * @param string $phone User's phone number
 * @param string $password User's password (plain text)
 * @return array Result with success status and message
 */
function registerUser($firstName, $lastName, $email, $phone, $password) {
    global $conn;
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        return [
            'success' => false,
            'message' => 'Email address already registered'
        ];
    }
    
    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $firstName, $lastName, $email, $phone, $hashedPassword);
    
    if ($stmt->execute()) {
        $userId = $conn->insert_id;
        
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_name'] = $firstName . ' ' . $lastName;
        $_SESSION['user_email'] = $email;
        
        $timestampStmt = $conn->prepare("SELECT created_at FROM users WHERE user_id = ?");
        $timestampStmt->bind_param("i", $userId);
        $timestampStmt->execute();
        $timestampResult = $timestampStmt->get_result();
        $createdAt = null;
        
        if ($timestampResult->num_rows > 0) {
            $row = $timestampResult->fetch_assoc();
            $createdAt = $row['created_at'];
        } else {
            $createdAt = date('Y-m-d H:i:s'); 
        }
        
        $user = [
            'user_id' => $userId,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'created_at' => $createdAt
        ];
        
        return [
            'success' => true,
            'message' => 'Registration successful',
            'user_id' => $userId,
            'user' => $user
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Registration failed: ' . $conn->error
        ];
    }
}

/**
 * Authenticate a user
 * 
 * @param string $email User's email
 * @param string $password User's password (plain text)
 * @param bool $remember Whether to remember login
 * @return array Result with success status and message
 */
function loginUser($email, $password, $remember = false) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT user_id, first_name, last_name, email, phone, password, created_at FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows !== 1) {
        return [
            'success' => false,
            'message' => 'Invalid email or password'
        ];
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        // Start session and set session variables
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
        $_SESSION['user_email'] = $email;
        
        // If remember me is checked, set a long-lived cookie
        if ($remember) {
            $token = bin2hex(random_bytes(32));
            setcookie('flightb_remember_token', $token, time() + (86400 * 30), "/");
        }
        
        // Create a safe user object without password
        $safeUser = [
            'user_id' => $user['user_id'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'created_at' => $user['created_at']
        ];
        
        return [
            'success' => true,
            'message' => 'Login successful',
            'user' => $safeUser
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Invalid email or password'
        ];
    }
}
?> 