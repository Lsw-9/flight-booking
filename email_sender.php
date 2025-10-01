<?php

 /**
 * Email Sender function for FlightB using PHPMailer
 */

// Include PHPMailer classes
require_once 'phpmailer/src/PHPMailer.php';
require_once 'phpmailer/src/SMTP.php';
require_once 'phpmailer/src/Exception.php';

// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Define email configuration
$default_config = [
    'smtp_host' => 'smtp.gmail.com',  // SMTP server address
    'smtp_port' => 587,               // SMTP port
    'smtp_username' => 'reminderapp12@gmail.com',  // SMTP username
    'smtp_password' => 'rvkfbaxkvoqpnquy',  // SMTP password
    'smtp_secure' => 'tls',           // Connection security
    'from_email' => 'noreply@flightb.com', // Masked sender email
    'from_name' => 'FlightB',         // Sender name
    'debug' => false,                 // Debug mode
    'verify_ssl' => false             // SSL certificate verification
];

/**
 * Send email using PHPMailer with email masking
 * 
 * @param string $to Recipient email address
 * @param string $subject Email subject
 * @param string $message Email body (HTML or plain text)
 * @param array $headers Additional email headers
 * @param array $config SMTP configuration (optional)
 * @param array $attachments File attachments (optional)
 * @return array Result status and details
 */
function sendEmailPHPMailer($to, $subject, $message, $headers = [], $config = [], $attachments = []) {
    global $default_config;
    
    $config = array_merge($default_config, $config);
    
    $config['from_email'] = 'noreply@flightb.com';
    
    // Validate essential settings
    if (empty($to) || empty($subject) || empty($message)) {
        return [
            'success' => false,
            'message' => 'Missing required parameters'
        ];
    }
    
    // Save email to file for backup/debugging
    $email_dir = 'email_logs';
    if (!file_exists($email_dir)) {
        mkdir($email_dir, 0777, true);
    }
    
    // Log file with the email content
    $timestamp = time();
    $filename = $email_dir . '/' . str_replace(['@', '.'], '_', $to) . '_' . $timestamp . '.html';
    $log_content = "To: $to\r\nFrom: {$config['from_name']} <{$config['from_email']}>\r\nSubject: $subject\r\nTimestamp: " . date('Y-m-d H:i:s', $timestamp) . "\r\n\r\n$message";
    file_put_contents($filename, $log_content);
    
    // If SMTP credentials are not provided, just log to file
    if (empty($config['smtp_username']) || empty($config['smtp_password'])) {
        error_log("Email would be sent to $to (subject: $subject) - Saved to $filename (SMTP not configured)");
        return [
            'success' => true,
            'message' => 'Email logged to file (SMTP not configured)',
            'file' => $filename,
            'method' => 'file',
            'masked_email' => true
        ];
    }
    
    try {
        // Create a new PHPMailer instance
        $mail = new PHPMailer(true);
        
        // Server settings
        if ($config['debug']) {
            $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        } else {
            $mail->SMTPDebug = SMTP::DEBUG_OFF;
        }
        
        // Configure SMTP
        $mail->isSMTP();
        $mail->Host = $config['smtp_host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['smtp_username'];
        $mail->Password = $config['smtp_password'];
        
        // Set encryption type
        if ($config['smtp_secure'] === 'tls') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        } elseif ($config['smtp_secure'] === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        }
        
        $mail->Port = $config['smtp_port'];
        
        // SSL verification settings
        if (!$config['verify_ssl']) {
            $mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ];
        }
        
        $mail->setFrom($config['from_email'], $config['from_name']);
        
        $mail->addAddress($to);
        
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $message;
        
        if (!empty($headers)) {
            foreach ($headers as $name => $value) {
 
                if (strtolower($name) !== 'from') {
                    $mail->addCustomHeader($name, $value);
                }
            }
        }
        

        if (!empty($attachments)) {
            foreach ($attachments as $attachment) {
                if (isset($attachment['path'])) {
                    $name = isset($attachment['name']) ? $attachment['name'] : '';
                    $mail->addAttachment($attachment['path'], $name);
                }
            }
        }
        
        // Send the email
        if ($mail->send()) {
            error_log("Email sent successfully to $to via PHPMailer");
            return [
                'success' => true,
                'message' => 'Email sent successfully via PHPMailer',
                'method' => 'phpmailer',
                'masked_email' => true,
                'file' => $filename
            ];
        } else {
            throw new Exception("PHPMailer did not report success");
        }
    }
    catch (Exception $e) {
        error_log("PHPMailer Error: " . $e->getMessage());
        return [
            'success' => false,
            'message' => "PHPMailer Error: " . $e->getMessage() . " - email saved to file",
            'error' => $e->getMessage(),
            'file' => $filename,
            'method' => 'file',
            'masked_email' => true
        ];
    }
}

/**
 * Legacy function for backwards compatibility
 */
function sendEmailSMTP($to, $subject, $message, $config = [], $attachments = []) {
    return sendEmailPHPMailer($to, $subject, $message, [], $config, $attachments);
}

/**
 * Send an email using the best available method with email masking
 * 
 * @param string $to Recipient email address
 * @param string $subject Email subject
 * @param string $message Email body (HTML or plain text)
 * @param array $headers Additional email headers
 * @param array $smtp_config SMTP configuration (optional)
 * @param array $attachments File attachments (optional)
 * @return array Result status and details
 */
function sendEmail($to, $subject, $message, $headers = [], $smtp_config = [], $attachments = []) {

    static $sentEmails = [];
    
    // Create a unique key for this specific email
    $messageHash = md5(substr($message, 0, 500));
    $emailKey = md5($to . $subject . $messageHash);
    
    // Log email attempt
    error_log("Attempting to send email to: $to, Subject: $subject, Key: $emailKey");
    
    // For check if this exact email has already been sent in this request
    if (isset($sentEmails[$emailKey])) {
        error_log("DUPLICATE EMAIL DETECTED - Skipping send to: $to, Subject: $subject, Key: $emailKey");
        return [
            'success' => true,
            'method' => 'skipped_duplicate',
            'message' => 'Duplicate email detected, skipping send',
            'original_result' => $sentEmails[$emailKey]
        ];
    }
    
    // Ensure the From header is always set to our masked email
    if (!isset($headers['From'])) {
        $headers['From'] = 'FlightB <noreply@flightb.com>';
    } else {

        $matches = [];
        if (preg_match('/^(.*)<.*>$/', $headers['From'], $matches) && !empty($matches[1])) {
            $name = trim($matches[1]);
            $headers['From'] = "$name <noreply@flightb.com>";
        } else {
            $headers['From'] = 'FlightB <noreply@flightb.com>';
        }
    }
    
    $result = sendEmailPHPMailer($to, $subject, $message, $headers, $smtp_config, $attachments);
    
    error_log("Email send result for $to (Key: $emailKey): " . json_encode($result));
    
    $sentEmails[$emailKey] = $result;
    
    return $result;
}

/**
 * Helper function to extract just the display name from a full email address
 * 
 * @param string $email Full email address (Name <email@example.com>)
 * @return string Display name only, or empty string if not found
 */
function extractDisplayName($email) {
    $matches = [];
    if (preg_match('/^(.*)<.*>$/', $email, $matches) && !empty($matches[1])) {
        return trim($matches[1]);
    }
    return '';
}


if (basename($_SERVER['SCRIPT_NAME']) === basename(__FILE__)) {

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $to = $_POST['to'] ?? '';
        $subject = $_POST['subject'] ?? '';
        $message = $_POST['message'] ?? '';
        $headers = $_POST['headers'] ?? [];
        $smtp_config = $_POST['smtp_config'] ?? [];
        
        if (empty($to) || empty($subject) || empty($message)) {
            echo json_encode([
                'success' => false,
                'message' => 'Missing required parameters (to, subject, message)'
            ]);
            exit;
        }
        
        $result = sendEmail($to, $subject, $message, $headers, $smtp_config);
        echo json_encode($result);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'This script only accepts POST requests'
        ]);
    }
}
?> 