<?php
// Database connection
require_once 'db_connection.php';

// Get search parameters
$departure = $_GET['departure'] ?? '';
$destination = $_GET['destination'] ?? '';
$departureDate = $_GET['departure_date'] ?? '';
$returnDate = $_GET['return_date'] ?? '';
$tripType = $_GET['trip-type'] ?? 'round-trip';
$passengers = intval($_GET['passengers'] ?? 1);
$class = $_GET['class'] ?? 'economy';
$adults = intval($_GET['adults'] ?? 1);
$children = intval($_GET['children'] ?? 0);
$infants = intval($_GET['infants'] ?? 0);

// Validate input
if (empty($departure) || empty($destination)) {
    // Return error if required parameters are missing
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Departure and destination cities are required'
    ]);
    exit;
}

$dummyFlights = generateDummyFlights($departure, $destination, $departureDate, $class, $passengers);

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'flights' => $dummyFlights,
    'search' => [
        'departure' => $departure,
        'destination' => $destination,
        'departureDate' => $departureDate,
        'returnDate' => $returnDate,
        'tripType' => $tripType,
        'passengers' => $passengers,
        'class' => $class,
        'adults' => $adults,
        'children' => $children,
        'infants' => $infants
    ]
]);

$conn->close();

/**
 * Generate dummy flights based on search criteria
 */
function generateDummyFlights($departure, $destination, $departureDate, $class, $passengers) {
  
    $airlines = ['FlightB Airways', 'FlightB Express', 'FlightB Premium'];
    
    $flights = [];
    
    // Generate 3-7 flights for variety
    $numFlights = rand(3, 7);
    
    // Set base price range based on class
    $basePriceMin = 150;
    $basePriceMax = 350;
    
    switch ($class) {
        case 'premium-economy':
            $basePriceMin = 250;
            $basePriceMax = 500;
            break;
        case 'business':
            $basePriceMin = 500;
            $basePriceMax = 1200;
            break;
        case 'first':
            $basePriceMin = 800;
            $basePriceMax = 2000;
            break;
    }
    
    // Start generating flights from 7 AM with roughly 1.5-hour intervals
    $departureHour = 7;
    
    for ($i = 1; $i <= $numFlights; $i++) {
        // Randomize departure time
        $departureHour += rand(1, 2);
        if ($departureHour > 21) {
            break; 
        }
        
        $departureMinutes = rand(0, 59);
        $departureTime = sprintf('%02d:%02d', $departureHour, $departureMinutes);
        
        // Generate duration between 1h30m and 5h
        $durationHours = rand(1, 4);
        $durationMinutes = rand(15, 59);
        $duration = sprintf('%dh %dm', $durationHours, $durationMinutes);
        
        // Calculate arrival time
        $arrivalHour = $departureHour + $durationHours;
        $arrivalMinutes = $departureMinutes + $durationMinutes;
        if ($arrivalMinutes >= 60) {
            $arrivalHour++;
            $arrivalMinutes = $arrivalMinutes - 60;
        }
        if ($arrivalHour > 23) {
            $arrivalHour = $arrivalHour - 24;
        }
        $arrivalTime = sprintf('%02d:%02d', $arrivalHour, $arrivalMinutes);
        
        // Format times as AM/PM
        $departureTimeFormatted = date('h:i A', strtotime($departureTime));
        $arrivalTimeFormatted = date('h:i A', strtotime($arrivalTime));
        
        // Price varies slightly for each flight
        $basePrice = rand($basePriceMin, $basePriceMax);
        
        // Add randomness to availability
        $availableSeats = rand(5, 150);
        
        // Generate a flight ID and flight number
        $flightId = $i;
        $flightPrefix = 'FB';
        $flightNumber = $flightPrefix . '-' . rand(1000, 9999);
        
        // Select a random airline
        $airline = $airlines[array_rand($airlines)];
        
        // Add flight to array
        $flights[] = [
            'flight_id' => $flightId,
            'flight_number' => $flightNumber,
            'airline' => $airline,
            'departure_city' => $departure,
            'destination_city' => $destination,
            'departure_time' => $departureTimeFormatted,
            'arrival_time' => $arrivalTimeFormatted,
            'duration' => $duration,
            'price' => $basePrice,
            'available_seats' => $availableSeats,
            'class' => $class
        ];
    }
    
    return $flights;
}
?> 