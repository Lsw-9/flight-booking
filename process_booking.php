<?php
// Session to track email sending status
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

// Database connection
if (file_exists('db_connection.php')) {
    @require_once 'db_connection.php';
}

if (file_exists('email_sender.php')) {
    @require_once 'email_sender.php';
}

error_log("Booking attempt started at " . date('Y-m-d H:i:s'));

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
   
    $flightId = $_POST['flightId'] ?? '';
    $departure = $_POST['departure'] ?? '';
    $destination = $_POST['destination'] ?? '';
    $departureDate = $_POST['departureDate'] ?? '';
    $returnDate = $_POST['returnDate'] ?? '';
    $tripType = $_POST['tripType'] ?? 'round-trip';
    $passengerCount = $_POST['passengerCount'] ?? 1;
    
   
    error_log("Received booking data: Flight ID: $flightId, From: $departure, To: $destination, Passengers: $passengerCount");
    
    $passengerNames = [];
    $passengerSeats = [];
    $passengerData = [];
    
    for ($i = 1; $i <= $passengerCount; $i++) {
        $title = $_POST["title_$i"] ?? '';
        $firstName = $_POST["firstName_$i"] ?? '';
        $lastName = $_POST["lastName_$i"] ?? '';
        $dob = $_POST["dob_$i"] ?? '';
        $nationality = $_POST["nationality_$i"] ?? '';
        $idType = $_POST["idType_$i"] ?? '';
        $idNumber = $_POST["idNumber_$i"] ?? '';
        $seat = $_POST["seat_$i"] ?? 'Not assigned';
        $type = $_POST["type_$i"] ?? 'Adult';
        
        $passengerNames[] = "$title $firstName $lastName";
        $passengerSeats[] = $seat;
        
        $passengerData[] = [
            'title' => $title,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'dob' => $dob,
            'nationality' => $nationality,
            'id_type' => $idType,
            'id_number' => $idNumber,
            'seat' => $seat,
            'type' => $type
        ];
        
        error_log("Passenger $i: $title $firstName $lastName, Seat: $seat, Type: $type");
    }
    

    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    
    $bookingReference = 'FB-' . strtoupper(substr(md5(uniqid()), 0, 8));
    
    if (empty($departure) || empty($destination) || empty($departureDate) || empty($email)) {
      
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Missing required information']);
        exit;
    }
    
    // Store booking in database if connection is available
    $bookingId = null;
    $dbSuccess = false;
    
    if (isset($conn) && $conn) {
        try {
            $conn->begin_transaction();
            
            $bookingSql = "INSERT INTO bookings (booking_reference, flight_id, trip_type, departure_date, return_date, passenger_count, contact_email, contact_phone, booking_status) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')";
            
            $bookingStmt = $conn->prepare($bookingSql);
            $bookingStmt->bind_param(
                "sississs",
                $bookingReference,
                $flightId,
                $tripType,
                $departureDate,
                $returnDate,
                $passengerCount,
                $email,
                $phone
            );
            
            if ($bookingStmt->execute()) {
                $bookingId = $conn->insert_id;
                error_log("Booking record created with ID: $bookingId");
                
                // Update the flight data in the database for the specific flight ID
                $updateFlightDataSql = "UPDATE flights SET departure_city = ?, destination_city = ? WHERE flight_id = ?";
                $updateFlightStmt = $conn->prepare($updateFlightDataSql);
                
                if ($updateFlightStmt) {
                    $updateFlightStmt->bind_param("ssi", $departure, $destination, $flightId);
                    
                    if (!$updateFlightStmt->execute()) {
                        error_log("Warning: Could not update flight cities: " . $updateFlightStmt->error);
                    } else {
                        error_log("Successfully updated flight cities for flight ID: $flightId");
                    }
                }
                
                // Insert passenger records
                $passengerSql = "INSERT INTO passengers (booking_id, title, first_name, last_name, date_of_birth, nationality, id_type, id_number, seat_number) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                $passengerStmt = $conn->prepare($passengerSql);
                
                foreach ($passengerData as $passenger) {
                    $passengerStmt->bind_param(
                        "issssssss",
                        $bookingId,
                        $passenger['title'],
                        $passenger['first_name'],
                        $passenger['last_name'],
                        $passenger['dob'],
                        $passenger['nationality'],
                        $passenger['id_type'],
                        $passenger['id_number'],
                        $passenger['seat']
                    );
                    
                    if (!$passengerStmt->execute()) {
                        error_log("Error adding passenger: " . $passengerStmt->error);
                        throw new Exception("Error adding passenger: " . $passengerStmt->error);
                    }
                }
                
                // Update available seats in flights table
                $updateSeatsSql = "UPDATE flights SET available_seats = available_seats - ? WHERE flight_id = ?";
                $seatsStmt = $conn->prepare($updateSeatsSql);
                $seatsStmt->bind_param("ii", $passengerCount, $flightId);
                
                if (!$seatsStmt->execute()) {
                    error_log("Error updating seats: " . $seatsStmt->error);
                    throw new Exception("Error updating seats: " . $seatsStmt->error);
                }
                
                // Commit transaction
                $conn->commit();
                $dbSuccess = true;
                error_log("Database transaction completed successfully");
            } else {
                error_log("Error creating booking: " . $bookingStmt->error);
                throw new Exception("Error creating booking: " . $bookingStmt->error);
            }
        } catch (Exception $e) {
          
            $conn->rollback();
            error_log("Database error: " . $e->getMessage());
        }
    } else {
        error_log("Database connection not available, skipping database operations");
    }
    
    // Prepare and send confirmation emails
    $adminEmailResult = ['success' => false, 'method' => 'none', 'message' => 'Email not sent'];
    $customerEmailResult = ['success' => false, 'method' => 'none', 'message' => 'Email not sent'];
    
    $emailSendKey = "emails_sent_" . $bookingReference;

    if (isset($_SESSION[$emailSendKey])) {
        error_log("Emails already sent for booking $bookingReference - not sending again");
        $emailResults = $_SESSION[$emailSendKey];
        $adminEmailResult = $emailResults['admin'];
        $customerEmailResult = $emailResults['customer'];
    } 
    else if (function_exists('sendEmail')) {
        error_log("Preparing email content for booking: $bookingReference");
        
        // Customer email content
        $customerSubject = "FlightB Booking Confirmation: $bookingReference";
        $customerMessage = createCustomerEmailContent($bookingReference, $passengerData, $departure, $destination, $departureDate, $returnDate, $tripType, $passengerSeats);
        
        // Admin email content 
        $adminEmail = "sengwei7075@gmail.com"; 
        $adminSubject = "New Booking Alert: $bookingReference";
        $adminMessage = createAdminEmailContent($bookingReference, $passengerData, $departure, $destination, $departureDate, $returnDate, $email, $phone);
        
        // Headers for each email
        $customerHeaders = ['From' => 'FlightB Customer Service <noreply@flightb.com>', 'X-Mailer' => 'FlightB-Booking-' . $bookingReference];
        $adminHeaders = ['From' => 'FlightB Booking System <noreply@flightb.com>', 'X-Mailer' => 'FlightB-Admin-' . $bookingReference];
        
        // Debugging
        error_log("Preparing to send emails for booking: $bookingReference");
        error_log("Customer email: $email, Subject: $customerSubject");
        error_log("Admin email: $adminEmail, Subject: $adminSubject");
        
        // Send emails with error handling
        try {
        
            $customerEmailResult = sendEmail($email, $customerSubject, $customerMessage, $customerHeaders);
            error_log("Customer email result: " . json_encode($customerEmailResult));
            
            $adminEmailResult = sendEmail($adminEmail, $adminSubject, $adminMessage, $adminHeaders);
            error_log("Admin email result: " . json_encode($adminEmailResult));
            
            $_SESSION[$emailSendKey] = [
                'admin' => $adminEmailResult,
                'customer' => $customerEmailResult,
                'timestamp' => time()
            ];
        } catch (Exception $e) {
            error_log("Error sending emails: " . $e->getMessage());
            
            if (!isset($customerEmailResult['success']) || !$customerEmailResult['success']) {
                $customerEmailResult = [
                    'success' => false, 
                    'method' => 'error', 
                    'message' => 'Failed to send customer email: ' . $e->getMessage()
                ];
            }
            
            if (!isset($adminEmailResult['success']) || !$adminEmailResult['success']) {
                $adminEmailResult = [
                    'success' => false, 
                    'method' => 'error', 
                    'message' => 'Failed to send admin email: ' . $e->getMessage()
                ];
            }
        }
    } else {
        error_log("Email sending function not available");
    }
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true, 
        'message' => 'Booking successful! A confirmation email has been sent to your email address.',
        'bookingId' => $bookingId,
        'dbSuccess' => $dbSuccess,
        'bookingReference' => $bookingReference,
        'adminEmailStatus' => $adminEmailResult,
        'customerEmailStatus' => $customerEmailResult,
        'redirect' => 'confirmation.html?ref=' . urlencode($bookingReference) 
                    . '&email=' . urlencode($email)
                    . '&adminEmail=' . urlencode(json_encode($adminEmailResult))
                    . '&customerEmail=' . urlencode(json_encode($customerEmailResult))
    ]);
    
} else {

    header('Location: index.html');
    exit;
}

/**
 * HTML email content for customer
 */
function createCustomerEmailContent($bookingRef, $passengers, $departure, $destination, $departureDate, $returnDate, $tripType, $seats) {
    $passengerList = '';
    foreach ($passengers as $index => $passenger) {
        $seatNumber = $seats[$index] ?? 'Not assigned';
        $passengerList .= "<tr>
            <td>{$passenger['title']} {$passenger['first_name']} {$passenger['last_name']}</td>
            <td>{$passenger['type']}</td>
            <td>{$seatNumber}</td>
        </tr>";
    }
    
    $returnInfo = ($tripType === 'round-trip') ? "<p><strong>Return Date:</strong> " . ($returnDate ?: 'Not specified') . "</p>" : "";
    
    $tripTypeDisplay = $tripType === 'round-trip' ? 'Round Trip' : 'One Way';
    
    $html = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { width: 600px; margin: 0 auto; }
            .header { background-color: #5662F6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .booking-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; }
            .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            table, th, td { border: 1px solid #ddd; }
            th, td { padding: 10px; text-align: left; }
            th { background-color: #5662F6; color: white; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Booking Confirmation</h1>
                <p>Reference: $bookingRef</p>
            </div>
            <div class='content'>
                <p>Dear Customer,</p>
                <p>Thank you for booking your flight with FlightB. Your booking has been confirmed!</p>
        
        <div class='booking-details'>
                    <h2>Flight Details</h2>
                    <p><strong>From:</strong> " . ucfirst($departure) . " to <strong>To:</strong> " . ucfirst($destination) . "</p>
                    <p><strong>Departure Date:</strong> $departureDate</p>
                    $returnInfo
                    <p><strong>Trip Type:</strong> $tripTypeDisplay</p>
                </div>
                
                <h2>Passenger Information</h2>
            <table>
                <tr>
                        <th>Name</th>
                        <th>Type</th>
                    <th>Seat</th>
                    </tr>
                    $passengerList
            </table>
            
                <p>Please arrive at the airport at least 2 hours before your departure time.</p>
                <p>For any questions or changes to your booking, please contact our customer service.</p>
            </div>
            <div class='footer'>
                <p>&copy; " . date('Y') . " FlightB. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>";
    
    return $html;
}

/**
 * HTML email content for admin
 */
function createAdminEmailContent($bookingRef, $passengers, $departure, $destination, $departureDate, $returnDate, $email, $phone) {
    $passengerList = '';
    foreach ($passengers as $passenger) {
        $passengerList .= "<tr>
            <td>{$passenger['title']} {$passenger['first_name']} {$passenger['last_name']}</td>
            <td>{$passenger['type']}</td>
            <td>{$passenger['dob']}</td>
            <td>{$passenger['nationality']}</td>
            <td>{$passenger['id_type']}: {$passenger['id_number']}</td>
        </tr>";
    }
    
    $returnInfo = !empty($returnDate) ? "<p><strong>Return Date:</strong> $returnDate</p>" : "<p><strong>Return Date:</strong> Not specified (One-way trip)</p>";
    
    $html = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { width: 600px; margin: 0 auto; }
            .header { background-color: #5662F6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .booking-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; }
            .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            table, th, td { border: 1px solid #ddd; }
            th, td { padding: 10px; text-align: left; }
            th { background-color: #5662F6; color: white; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>New Booking Alert</h1>
                <p>Reference: $bookingRef</p>
            </div>
            <div class='content'>
                <p>A new booking has been made:</p>
                
                <div class='booking-details'>
                    <h2>Flight Details</h2>
                    <p><strong>From:</strong> " . ucfirst($departure) . " to <strong>To:</strong> " . ucfirst($destination) . "</p>
                    <p><strong>Departure Date:</strong> $departureDate</p>
                    $returnInfo
                </div>
            
            <div class='booking-details'>
                    <h2>Contact Information</h2>
                    <p><strong>Email:</strong> $email</p>
                    <p><strong>Phone:</strong> $phone</p>
                </div>
                
                <h2>Passenger Information</h2>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>DOB</th>
                        <th>Nationality</th>
                        <th>ID Information</th>
                    </tr>
                    $passengerList
                </table>
            </div>
            <div class='footer'>
                <p>&copy; " . date('Y') . " FlightB Admin System.</p>
            </div>
        </div>
    </body>
    </html>";
    
    return $html;
}
?> 