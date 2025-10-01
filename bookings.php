<?php
// Database connection
require_once 'db_connection.php';

// Function to sanitize output
function sanitize($data) {
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// Fetch bookings with their passengers
$sql = "SELECT b.booking_id, b.booking_reference, b.trip_type, 
               b.departure_date, b.return_date, b.passenger_count, 
               b.contact_email, b.contact_phone, b.booking_status, b.created_at,
               f.flight_number, f.departure_city, f.destination_city, 
               f.departure_time, f.arrival_time, f.base_price as price
        FROM bookings b
        JOIN flights f ON b.flight_id = f.flight_id
        ORDER BY b.created_at DESC";
        
$result = $conn->query($sql);

// Function to format city names for display
function formatCityName($cityName) {
    if (empty($cityName)) return 'Unknown';
    
    return ucwords(str_replace('-', ' ', $cityName));
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FlightB - Booking History</title>
    <!-- Add Google Fonts link for consistency -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        /* Apply the main font to ensure consistency */
        body, h1, h2, h3, h4, p, span, div {
            font-family: 'Poppins', sans-serif;
        }
        
        .bookings-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            padding-top: 100px;
        }
        
        .booking-card {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            padding: 20px;
            transition: transform 0.3s ease;
        }
        
        .booking-card:hover {
            transform: translateY(-5px);
        }
        
        .booking-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        
        .booking-reference {
            font-weight: bold;
            color: #5662F6;
        }
        
        .booking-status {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
        }
        
        .status-confirmed {
            background-color: #e0f7e0;
            color: #2e7d32;
        }
        
        .status-cancelled {
            background-color: #ffebee;
            color: #c62828;
        }
        
        .status-pending {
            background-color: #fff9c4;
            color: #f57f17;
        }
        
        .flight-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        
        .flight-cities {
            font-size: 18px;
            font-weight: bold;
        }
        
        .flight-dates {
            color: #666;
        }
        
        .passenger-list {
            margin-top: 15px;
        }
        
        .passenger-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #eee;
        }
        
        .contact-info {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: space-between;
        }
        
        .no-bookings {
            text-align: center;
            padding: 50px;
            background-color: #f9f9f9;
            border-radius: 8px;
            color: #666;
        }
        
        @media (max-width: 768px) {
            .flight-details {
                flex-direction: column;
            }
            
            .contact-info {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <nav>
            <div class="logo">
                <h1>Flight<span>B</span></h1>
            </div>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="index.html#flight-selection">Flights</a></li>
                <li><a href="index.html#about">About</a></li>
                <li><a href="index.html#footer-contact">Contact</a></li>
                <li><a href="bookings.php" class="active">Booking History</a></li>
            </ul>
            <div class="auth-buttons">
                <button class="login-btn">Login</button>
                <button class="signup-btn">Sign Up</button>
            </div>
            <div class="hamburger">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </nav>
    </header>
    
    <!-- Main Content -->
    <main>
        <div class="bookings-container">
            <h1>Your Flight Booking History</h1>
            <p class="info-text">View all your past and upcoming flights in one place. Check booking details, passenger information, and flight status.</p>
            
            <?php if ($result && $result->num_rows > 0): ?>
                <?php while($booking = $result->fetch_assoc()): ?>
                    <div class="booking-card">
                        <div class="booking-header">
                            <span class="booking-reference">Booking Reference: <?= sanitize($booking['booking_reference']) ?></span>
                            <span class="booking-status status-<?= strtolower($booking['booking_status']) ?>">
                                <?= ucfirst(sanitize($booking['booking_status'])) ?>
                            </span>
                        </div>
                        
                        <div class="flight-details">
                            <div>
                                <div class="flight-cities">
                                    <?= formatCityName(sanitize($booking['departure_city'])) ?> to <?= formatCityName(sanitize($booking['destination_city'])) ?>
                                </div>
                                <div class="flight-info">
                                    Flight: <?= sanitize($booking['flight_number']) ?> | 
                                    Departure: <?= date('h:i A', strtotime($booking['departure_time'])) ?> | 
                                    Arrival: <?= date('h:i A', strtotime($booking['arrival_time'])) ?>
                                </div>
                            </div>
                            <div class="flight-dates">
                                <div>Departure Date: <?= date('d M Y', strtotime($booking['departure_date'])) ?></div>
                                <?php if (!empty($booking['return_date'])): ?>
                                    <div>Return Date: <?= date('d M Y', strtotime($booking['return_date'])) ?></div>
                                <?php endif; ?>
                                <div>Passengers: <?= (int)$booking['passenger_count'] ?></div>
                            </div>
                        </div>
                        
                        <div class="passenger-list">
                            <h3>Passenger Information</h3>
                            <?php
                            // Fetch passengers for this booking
                            $passengersQuery = "SELECT * FROM passengers WHERE booking_id = " . (int)$booking['booking_id'];
                            $passengersResult = $conn->query($passengersQuery);
                            
                            if ($passengersResult && $passengersResult->num_rows > 0):
                                while($passenger = $passengersResult->fetch_assoc()):
                            ?>
                                <div class="passenger-item">
                                    <div>
                                        <?= sanitize($passenger['title']) ?> 
                                        <?= sanitize($passenger['first_name']) ?> 
                                        <?= sanitize($passenger['last_name']) ?>
                                    </div>
                                    <div>Seat: <?= sanitize($passenger['seat_number']) ?></div>
                                </div>
                            <?php
                                endwhile;
                            endif;
                            ?>
                        </div>
                        
                        <div class="contact-info">
                            <div>Email: <?= sanitize($booking['contact_email']) ?></div>
                            <div>Phone: <?= sanitize($booking['contact_phone']) ?></div>
                            <div>Booked on: <?= date('d M Y, h:i A', strtotime($booking['created_at'])) ?></div>
                        </div>
                    </div>
                <?php endwhile; ?>
            <?php else: ?>
                <div class="no-bookings">
                    <h2>No bookings found</h2>
                    <p>You don't have any flight bookings in your history yet.</p>
                    <p><a href="index.html#flight-selection" class="btn">Book a Flight</a></p>
                </div>
            <?php endif; ?>
        </div>
    </main>
    
    <!-- Footer -->
    <footer>
        <div class="footer-container">
            <div class="footer-section">
                <h3>About FlightB</h3>
                <p>FlightB is your trusted partner for affordable and convenient flights. We specialize in connecting you to destinations across the country with comfort and ease.</p>
            </div>
            
            <div class="footer-section">
                <h3>Quick Links</h3>
                <ul class="footer-links">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="index.html#flight-selection">Flights</a></li>
                    <li><a href="index.html#about">About Us</a></li>
                    <li><a href="index.html#footer-contact">Contact</a></li>
                    <li><a href="bookings.php">Booking History</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h3>Contact Us</h3>
                <p><i class="fas fa-map-marker-alt"></i> 123 Aviation Street, Kuala Lumpur</p>
                <p><i class="fas fa-phone"></i> +60 3-1234 5678</p>
                <p><i class="fas fa-envelope"></i> info@flightb.com</p>
            </div>
            
            <div class="footer-section">
                <h3>Connect With Us</h3>
                <div class="social-icons">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p>&copy; 2023 FlightB. All rights reserved.</p>
            <div class="footer-legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
            </div>
        </div>
    </footer>

    <!-- Login Modal -->
    <div class="modal" id="login-modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Login to Your Account</h2>
            <form class="login-form">
                <div class="form-group">
                    <label for="login-email">Email</label>
                    <input type="email" id="login-email" name="login-email" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" name="login-password" required>
                </div>
                <div class="form-group">
                    <div class="remember-forgot">
                        <div class="remember-me-container">
                            <input type="checkbox" id="remember-me">
                            <label for="remember-me">Remember me</label>
                        </div>
                        <a href="#" id="forgot-password-link">Forgot Password?</a>
                    </div>
                </div>
                <button type="submit" class="login-submit">Login</button>
                <p class="switch-form">Don't have an account? <a href="#" id="switch-to-signup">Sign Up</a></p>
            </form>
        </div>
    </div>

    <!-- Sign Up Modal -->
    <div class="modal" id="signup-modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Create an Account</h2>
            <form class="signup-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="signup-firstname">First Name</label>
                        <input type="text" id="signup-firstname" name="signup-firstname" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-lastname">Last Name</label>
                        <input type="text" id="signup-lastname" name="signup-lastname" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="signup-email">Email</label>
                    <input type="email" id="signup-email" name="signup-email" required>
                </div>
                <div class="form-group">
                    <label for="signup-phone">Phone Number</label>
                    <input type="tel" id="signup-phone" name="signup-phone" required>
                </div>
                <div class="form-group">
                    <label for="signup-password">Password</label>
                    <input type="password" id="signup-password" name="signup-password" required>
                </div>
                <div class="form-group">
                    <label for="signup-confirm-password">Confirm Password</label>
                    <input type="password" id="signup-confirm-password" name="signup-confirm-password" required>
                </div>
                <div class="form-group terms">
                    <input type="checkbox" id="terms" required>
                    <label for="terms">I agree to the <a href="#">Terms and Conditions</a></label>
                </div>
                <button type="submit" class="signup-submit">Sign Up</button>
                <p class="switch-form">Already have an account? <a href="#" id="switch-to-login">Login</a></p>
            </form>
        </div>
    </div>

    <!-- Forgot Password Modal -->
    <div class="modal" id="forgot-password-modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Forgot Password</h2>
            <p>Enter your email address below and we'll send you a link to reset your password.</p>
            <form class="forgot-password-form">
                <div class="form-group">
                    <label for="forgot-email">Email</label>
                    <input type="email" id="forgot-email" name="forgot-email" required>
                </div>
                <button type="submit" class="login-submit">Reset Password</button>
                <p class="switch-form">Remember your password? <a href="#" id="switch-to-login-from-forgot">Login</a></p>
            </form>
        </div>
    </div>

    <!-- Reset Password Modal -->
    <div class="modal" id="reset-password-modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Reset Password</h2>
            <p>Enter your email and create a new password.</p>
            <form class="reset-password-form">
                <div class="form-group">
                    <label for="reset-email">Email</label>
                    <input type="email" id="reset-email" name="reset-email" required>
                </div>
                <div class="form-group">
                    <label for="reset-password">New Password</label>
                    <input type="password" id="reset-password" name="reset-password" required>
                </div>
                <div class="form-group">
                    <label for="reset-confirm-password">Confirm New Password</label>
                    <input type="password" id="reset-confirm-password" name="reset-confirm-password" required>
                </div>
                <input type="hidden" id="reset-token" name="reset-token" value="">
                <button type="submit" class="login-submit">Save New Password</button>
                <p class="switch-form">Remember your password? <a href="#" id="switch-to-login-from-reset">Login</a></p>
            </form>
        </div>
    </div>

    <script src="js/script.js"></script>
</body>
</html>

<?php

$conn->close();
?> 