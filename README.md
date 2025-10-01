## Name: FlightB Booking website
## Title: Flight Booking System ReadMe text file

This flight booking system has implemented the required features stated in the assignment deliverables 
including search, flight booking, and receiving email confirmations. 
Below are the step-by-step instructions for running the project on your local machine:

## Required tools for running the project
   - XAMPP
   - Web browser
   - Text editor or IDE for modifying files if needed
   
## steps for Installation
Follow these steps to set up the FlightB project:

1. Download and Install XAMPP
   - Visit [Apache Friends](https://www.apachefriends.org/) and download the appropriate version for your operating system
   - Follow the installation instructions provided on the website

2. Start XAMPP Services
   - Open the XAMPP Control Panel
   - Start the Apache and MySQL services

3. Deploy the Project
   - Extract the FlightB project files to the `htdocs` directory of your XAMPP installation:
     - Windows: `C:\xampp\htdocs\FlightB`
     - macOS: `/Applications/XAMPP/xamppfiles/htdocs/FlightB`
     - Linux: `/opt/lampp/htdocs/FlightB`

4. Access the Project
   - Open your web browser
   - Navigate to `http://localhost/FlightB/`

## Database Setup

**Important**
If there's an issue while processing booking details or sending email notifications, 
it is likely due to a common issue related to database connectivity when moving the project to a new device. 
This issue may persist even if the database is exported and included in the project folder, but phpMyAdmin still shows an error stating that the database does not exist.
The only working solution to resolve this issue is to recreate the database and its associated tables. 
Please follow the steps below to recreate the database correctly:

1. **Access phpMyAdmin**
   - Open your web browser
   - Navigate to `http://localhost/phpmyadmin`
   - Drop the databese and tables that showing error about not exist

2. **Create the database**
   - Click on "New" in the left sidebar or choose the existing one
   - Enter "flightb_db" as the database name
   - Click "Create"

3. **Import the database structure**
   - Either import the provided SQL file if available, or
   - Manually create the required tables using the SQL statements below:

```sql
-- Create flights table
CREATE TABLE flights (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL,
    airline VARCHAR(100) NOT NULL,
    departure_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration VARCHAR(50) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    flight_id INT NOT NULL,
    trip_type VARCHAR(20) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE,
    passenger_count INT NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id)
);

-- Create passengers table
CREATE TABLE passengers (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    title VARCHAR(10) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    id_type VARCHAR(50) NOT NULL,
    id_number VARCHAR(100) NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Create users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

4. **Verify Database Connection**
   - Open `db_connection.php` in the project root directory
   - Ensure the database configuration matches your setup:
     ```php
     $servername = "localhost";  // MySQL server
     $username = "root";         // Default username
     $password = "";             // Default password (blank for default XAMPP)
     $dbname = "flightb_db";     // Database name
     ```
   - If your MySQL setup has different credentials, update these values accordingly

## Common Issues and Troubleshooting

### Database Connection
If you encounter database connection errors like "Connection failed", "Network error" or "Database not found":

1. **Verify Database Existence**
   - Check if the "flightb_db" database exists in phpMyAdmin
   - If not, create it following the database set up steps given

2. **Check Table Structure**
   - Verify that all required tables (flights, bookings, passengers, users) exist
   - If tables are missing, run the SQL commands provided in the database setup section

3. **Check Database Credentials**
   - Ensure the credentials in `db_connection.php` match your MySQL setup
   - The default XAMPP installation uses:
     - Username: `root`
     - Password: `` (blank)
   - If you've set a custom password for your MySQL server, update the file accordingly


### Booking Processing

If bookings are not being processed correctly:

1. **Database Connection**
   - This is most likely due to the database connection issue described above
   - Follow the database setup steps given to ensure all tables are properly created

2. **Email Configuration**
   - If booking confirmations are not being sent via email:
     - Check the `email_sender.php` configuration
     - Ensure the SMTP settings are correct
     - For testing, the system will save email logs in the `email_logs` directory
	 - Update Admin Email Address: If you want to change the admin email address that receives booking notifications, 
	   you can update it in process_booking.php on line 193. 
	   Just simply replace the existing email address with your desired one.

3. **Debugging**
   - Check the server logs for PHP errors
   - Look in the `email_logs` directory for any saved emails that failed to send


## Project Structure
The project is organized as follows:

- **PHP Files**
  - `db_connection.php`: Database connection configuration
  - `user_auth.php`: User authentication functions
  - `process_booking.php`: Booking processing logic
  - `email_sender.php`: Email handling functionality
  - `bookings.php`: logic for retrieve the stored booking details and display them in booking history
  - `login.php`,`logout.php`,`reset_password.php`,`register.php`
    `user_auth.php`, `check_auth.php`: All these files are authentication logic and function
  - `fetch_flights.php`: logic for generate available flight.
  - `footer.php`: footer for the application.
  
- **HTML Files**
  - `index.html`: Main landing page and flight search
  - `confirmation.html`: Booking confirmation details
  - `booking_info.html`: Interface of booking history details

- **CSS Files**
  - `css/style.css`: Main styling for the application

- **JavaScript Files**
  - `js/script.js`: Core frontend functionality

- **Images Directory**: Contains all images used in the application

- **Email Logs Directory**: Stores logs of emails sent or attempted to be sent 

- **PHPmailer Directory**: Essential files for email notification function, used to send booking confirmations and other email notifications.