// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add initial loading class to hide auth buttons until auth check is complete
    document.body.classList.add('auth-loading');
    
    /**
     * Initializes authentication elements based on session storage data
     * An initial state before the server auth check completes
     */
    function initializeAuthElements() {
        // Initially hide login/signup buttons and user menu
        const loginButtons = document.querySelectorAll('.login-btn');
        const signupButtons = document.querySelectorAll('.signup-btn');
        const userMenus = document.querySelectorAll('.user-menu');
        const authContainers = document.querySelectorAll('.auth-buttons');
        
        // Check if the user data in session storage
        const storedUser = sessionStorage.getItem('currentUser');
        
        if (storedUser) {
            // Once logged in, hide auth buttons, show user menu
            loginButtons.forEach(btn => { 
                if (btn) btn.style.display = 'none'; 
            });
            
            signupButtons.forEach(btn => { 
                if (btn) btn.style.display = 'none'; 
            });
            
            // Make sure auth containers remain visible for layout consistency
            authContainers.forEach(container => {
                if (container) container.classList.add('has-user-menu');
            });
            
            // Show user menu or create if doesn't exist
            if (userMenus.length > 0) {
                userMenus.forEach(menu => { 
                    if (menu) menu.style.display = 'inline-flex'; 
                });
                // Use stored user data to update menu immediately
                try {
                    const userData = JSON.parse(storedUser);
           
                    setTimeout(() => {
                        if (typeof updateUserMenuWithData === 'function') {
                            updateUserMenuWithData(userData);
                        }
                    }, 0);
                } catch (e) {
                    console.error('Error parsing stored user data:', e);
                }
            } else {
               
            }
        } else {
            // For user likely not logged in
            loginButtons.forEach(btn => { 
                if (btn) btn.style.display = 'inline-block'; 
            });
            
            signupButtons.forEach(btn => { 
                if (btn) btn.style.display = 'inline-block'; 
            });
            
            authContainers.forEach(container => {
                if (container) container.classList.remove('has-user-menu');
            });
            
            userMenus.forEach(menu => { 
                if (menu) menu.style.display = 'none'; 
            });
        }
        
      
        setTimeout(() => {
            document.body.classList.remove('auth-loading');
        }, 50);
    }
    
    
    initializeAuthElements();

    // For mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu when a nav link is clicked
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
            
            
            navItems.forEach(link => link.classList.remove('active'));
           
            this.classList.add('active');
        });
    });
    
    // Set active class based on current URL or scroll position
    function setActiveNavLink() {
        const navItems = document.querySelectorAll('.nav-links a');
        if (!navItems.length) return;
        
        const path = window.location.pathname;
        const currentPage = path.substring(path.lastIndexOf('/') + 1);
        const currentHash = window.location.hash;

        navItems.forEach(item => item.classList.remove('active'));
        
        if (currentPage === 'bookings.php') {
            // For bookings page, activate the Manage Booking link
            navItems.forEach(item => {
                if (item.textContent.includes('Manage Booking')) {
                    item.classList.add('active');
                }
            });
        } else if (currentPage === 'flights.php') {
            // For flights page, activate the Flights link
            navItems.forEach(item => {
                if (item.textContent.includes('Flights')) {
                    item.classList.add('active');
                }
            });
        } else if (currentHash) {
            // For pages with hash, set active based on the hash
            navItems.forEach(item => {
                const href = item.getAttribute('href');
                if (href && href.includes(currentHash)) {
                    item.classList.add('active');
                }
            });
        } else if (currentPage === 'index.html' || currentPage === '') {
            // For home page, initially set Home as active
            const homeLink = document.querySelector('.nav-links li:first-child a');
            if (homeLink) {
                homeLink.classList.add('active');
            }
            
         
            const sections = document.querySelectorAll('section[id]');
            
            // Check which section is in view
            window.addEventListener('scroll', function() {
                let current = '';
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;
                    if (window.pageYOffset >= sectionTop - 200) {
                        current = section.getAttribute('id');
                    }
                });
                
             
                if (current) {
                    navItems.forEach(item => {
                        item.classList.remove('active');
                        
                        const href = item.getAttribute('href');
                        if (href.includes('#' + current)) {
                            item.classList.add('active');
                        }
                    });
                }
            });
        }
    }
    
    // Call the function to set active nav link
    setActiveNavLink();

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
          
            const href = this.getAttribute('href');
            
            if (href.startsWith('http')) return;
            
            navItems.forEach(link => link.classList.remove('active'));
            
            this.classList.add('active');
            
            if (href.includes('#') && 
                (window.location.pathname.endsWith('index.html') || 
                 window.location.pathname.endsWith('/'))) {
                const targetId = href.split('#')[1];
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Booking flow navigation
    const ctaButton = document.querySelector('.cta-button');
    const searchButton = document.querySelector('.search-btn');
    const availableFlightsSection = document.getElementById('available-flights');
    const passengerDetailsSection = document.getElementById('passenger-details');
    const seatSelectionSection = document.getElementById('seat-selection');
    const backButtons = document.querySelectorAll('.back-btn');
    const continueButtons = document.querySelectorAll('.continue-btn');

    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            document.getElementById('flight-selection').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Handle flight search form submission
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(loadingOverlay);
            
           
            const formData = new FormData(this);
            const searchParams = new URLSearchParams();
            
            for (const [key, value] of formData.entries()) {
                searchParams.append(key, value);
            }
            
            // Fetch flights based on search criteria
            fetch(`fetch_flights.php?${searchParams.toString()}`)
                .then(response => response.json())
                .then(data => {
               
                    document.body.removeChild(loadingOverlay);
                    
                    displayFlights(data);
                })
                .catch(error => {
                    document.body.removeChild(loadingOverlay);
                    
                    showError('Error fetching flights. Please try again later.', true);
                    console.error('Error fetching flights:', error);
                });
        });
    }

    // Back buttons functionality
    if (backButtons) {
        backButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentSection = this.closest('section');
                
                if (currentSection.id === 'passenger-details') {
                    currentSection.classList.add('hidden');
                    availableFlightsSection.classList.remove('hidden');
                    window.scrollTo({ top: availableFlightsSection.offsetTop - 100, behavior: 'smooth' });
                } else if (currentSection.id === 'seat-selection') {
                    currentSection.classList.add('hidden');
                    passengerDetailsSection.classList.remove('hidden');
                    window.scrollTo({ top: passengerDetailsSection.offsetTop - 100, behavior: 'smooth' });
                }
            });
        });
    }

    // Continue buttons functionality
    if (continueButtons) {
        continueButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentSection = this.closest('section');
                
                if (currentSection.id === 'passenger-details') {
                    // Validate passenger form
                    if (validatePassengerForm()) {
                        passengerDetailsSection.classList.add('hidden');
                        seatSelectionSection.classList.remove('hidden');
                        window.scrollTo({ top: seatSelectionSection.offsetTop - 100, behavior: 'smooth' });
                        generateSeatMap();
                    }
                }
            });
        });
    }

    // Trip type toggle
    const roundTripRadio = document.getElementById('round-trip');
    const oneWayRadio = document.getElementById('one-way');
    const returnDateField = document.querySelector('.return-date');

    if (oneWayRadio && roundTripRadio && returnDateField) {
        oneWayRadio.addEventListener('change', function() {
            if (this.checked) {
                returnDateField.style.display = 'none';
            }
        });

        roundTripRadio.addEventListener('change', function() {
            if (this.checked) {
                returnDateField.style.display = 'block';
            }
        });
    }

    // Modal handling
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const resetPasswordModal = document.getElementById('reset-password-modal');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const switchToLoginFromForgot = document.getElementById('switch-to-login-from-forgot');
    const switchToLoginFromReset = document.getElementById('switch-to-login-from-reset');

    // Open login modal
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', function() {
            loginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Open signup modal
    if (signupBtn && signupModal) {
        signupBtn.addEventListener('click', function() {
            signupModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modals when clicking the X
    if (closeButtons) {
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        });
    }

    // Close modals when clicking outside content
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Switch between login and signup
    if (switchToSignup) {
        switchToSignup.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'none';
            signupModal.style.display = 'block';
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            signupModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }

    // Forgot password link
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'none';
            forgotPasswordModal.style.display = 'block';
        });
    }

    // Return to login from forgot password
    if (switchToLoginFromForgot) {
        switchToLoginFromForgot.addEventListener('click', function(e) {
            e.preventDefault();
            forgotPasswordModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }

    // Return to login from reset password
    if (switchToLoginFromReset) {
        switchToLoginFromReset.addEventListener('click', function(e) {
            e.preventDefault();
            resetPasswordModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }

    // Form validation
    const loginForm = document.querySelector('.login-form');
    const signupForm = document.querySelector('.signup-form');
    const forgotPasswordForm = document.querySelector('.forgot-password-form');
    const resetPasswordForm = document.querySelector('.reset-password-form');
    
    if (loginForm) {
        if (localStorage.getItem('flightb_email') && localStorage.getItem('flightb_remember')) {
            document.getElementById('login-email').value = localStorage.getItem('flightb_email');
            document.getElementById('remember-me').checked = true;
        }
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateLoginForm()) {
             
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerText;
                submitBtn.innerText = 'Logging in...';
                submitBtn.disabled = true;
                
                const rememberMe = document.getElementById('remember-me');
                const loginEmail = document.getElementById('login-email').value;
                const loginPassword = document.getElementById('login-password').value;
                
                if (rememberMe.checked) {
                    localStorage.setItem('flightb_email', loginEmail);
                    localStorage.setItem('flightb_remember', 'true');
                } else {
                    localStorage.removeItem('flightb_email');
                    localStorage.removeItem('flightb_remember');
                }
                
                const formData = new FormData();
                formData.append('email', loginEmail);
                formData.append('password', loginPassword);
                formData.append('remember', rememberMe.checked);
                
                fetch('login.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    
                    if (data.success) {
                       
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                        
                        if (data.user) {
                            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                        }
                        
                        updateUserInterface(true);
                        
                        showSuccess('Login successful! Welcome back.');
                    } else {
                        
                        showError(data.message || 'Login failed. Please check your credentials.', true);
                        
                        if (data.errors && data.errors.length > 0) {
                            data.errors.forEach(error => {
                                console.error(error);
                            });
                        }
                    }
                })
                .catch(error => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    showError('An error occurred. Please try again later.', true);
                    console.error('Login error:', error);
                });
            }
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateSignupForm()) {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerText;
                submitBtn.innerText = 'Creating account...';
                submitBtn.disabled = true;
                
                // Get form data
                const firstname = document.getElementById('signup-firstname').value;
                const lastname = document.getElementById('signup-lastname').value;
                const email = document.getElementById('signup-email').value;
                const phone = document.getElementById('signup-phone').value;
                const password = document.getElementById('signup-password').value;
                const confirmPassword = document.getElementById('signup-confirm-password').value;
                
                // Send the form data to the server
                const formData = new FormData();
                formData.append('firstname', firstname);
                formData.append('lastname', lastname);
                formData.append('email', email);
                formData.append('phone', phone);
                formData.append('password', password);
                formData.append('confirm_password', confirmPassword);
                
                fetch('register.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    
                    if (data.success) {
                        // Registration successful
                signupModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                        
                        // Store user data if available
                        if (data.user) {
                            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                        } else {
                          
                            const user = {
                                first_name: firstname,
                                last_name: lastname,
                                email: email,
                                phone: phone,
                                created_at: new Date().toISOString()
                            };
                            sessionStorage.setItem('currentUser', JSON.stringify(user));
                        }
                        
                        updateUserInterface(true);
                        
                        showSuccess('Account created successfully! Welcome to FlightB.');
                    } else {
                       
                        showError(data.message || 'Registration failed. Please try again.', true);
                        
                        if (data.errors && data.errors.length > 0) {
                            data.errors.forEach(error => {
                                showError(error, true);
                            });
                        }
                    }
                })
                .catch(error => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    showError('An error occurred. Please try again later.', true);
                    console.error('Registration error:', error);
                });
            }
        });
    }

    // Function to update the UI based on login state
    function updateUserInterface(isLoggedIn) {
     
        const loginButtons = document.querySelectorAll('.login-btn');
        const signupButtons = document.querySelectorAll('.signup-btn');
        const userMenus = document.querySelectorAll('.user-menu');
        const authContainers = document.querySelectorAll('.auth-buttons');
        
        if (isLoggedIn) {
            // Hide login/signup buttons
            loginButtons.forEach(btn => {
                if (btn) btn.style.display = 'none';
            });
            
            signupButtons.forEach(btn => {
                if (btn) btn.style.display = 'none';
            });
            
            // Mark auth containers as having user menu for styling
            authContainers.forEach(container => {
                if (container) container.classList.add('has-user-menu');
            });
            
            // Show user menu if it exists
            userMenus.forEach(menu => {
                if (menu) {
                    menu.style.display = 'inline-flex';
                }
            });
            
            // Add user menu if it doesn't exist
            if (userMenus.length === 0) {
                addUserMenu();
            } else {
                // Update existing user menu with current user data
                updateUserMenuInfo();
            }
        } else {
            // Show login/signup buttons
            loginButtons.forEach(btn => {
                if (btn) btn.style.display = 'inline-block';
            });
            
            signupButtons.forEach(btn => {
                if (btn) btn.style.display = 'inline-block';
            });
            
            // Remove user menu class from auth containers
            authContainers.forEach(container => {
                if (container) container.classList.remove('has-user-menu');
            });
            
            // Hide user menu
            userMenus.forEach(menu => {
                if (menu) {
                    menu.style.display = 'none';
                }
            });
        }
    }
    
    // Function to add user menu to the navigation
    function addUserMenu() {
   
        if (document.querySelector('.user-menu')) return;
        
        const authButtonsContainer = document.querySelector('.auth-buttons');
        
        if (!authButtonsContainer) {
            console.error('Cannot find auth buttons container to add user menu');
            return;
        }
        
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        
        userMenu.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-dropdown">
                <div class="user-dropdown-header">
                    <h4>Loading...</h4>
                </div>
                <div class="user-dropdown-content">
                    <div class="user-info">
                        <p><i class="fas fa-spinner fa-spin"></i> Loading user info...</p>
                    </div>
                </div>
                <div class="user-dropdown-footer">
                    <button id="logout-btn" class="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        `;
        
        authButtonsContainer.appendChild(userMenu);
        
        authButtonsContainer.classList.add('has-user-menu');
        
        // Add event listener for avatar click
        const userAvatar = userMenu.querySelector('.user-avatar');
        const userDropdown = userMenu.querySelector('.user-dropdown');
        
        userAvatar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        const logoutBtn = userMenu.querySelector('#logout-btn');
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
        
        document.addEventListener('click', function(e) {
            const allDropdowns = document.querySelectorAll('.user-dropdown');
            allDropdowns.forEach(dropdown => {
                if (!dropdown.parentElement.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
        });
        
        updateUserMenuInfo();
    }
    
    // Function to update user menu with user information
    function updateUserMenuInfo() {
     
        fetch('check_auth.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.isLoggedIn && data.user) {
                    updateUserMenuWithData(data.user);
                } else {
               
                    const storedUser = sessionStorage.getItem('currentUser');
                    if (storedUser) {
                        try {
                            const userData = JSON.parse(storedUser);
                            updateUserMenuWithData(userData);
                        } catch (e) {
                            console.error('Error parsing stored user data:', e);
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
                
                const storedUser = sessionStorage.getItem('currentUser');
                if (storedUser) {
                    try {
                        const userData = JSON.parse(storedUser);
                        updateUserMenuWithData(userData);
                    } catch (e) {
                        console.error('Error parsing stored user data:', e);
                    }
                }
            });
    }
    
    // Helper function to update user menu with user data
    function updateUserMenuWithData(user) {
        const userMenu = document.querySelector('.user-menu');
        
        if (userMenu) {
            const avatar = userMenu.querySelector('.user-avatar');
            const dropdownHeader = userMenu.querySelector('.user-dropdown-header');
            const userInfo = userMenu.querySelector('.user-info');
            
            const firstInitial = user.first_name ? user.first_name.charAt(0).toUpperCase() : '';
            const lastInitial = user.last_name ? user.last_name.charAt(0).toUpperCase() : '';
            const initials = firstInitial + lastInitial;
            
            avatar.innerHTML = initials || '<i class="fas fa-user"></i>';
            
            dropdownHeader.innerHTML = `
                <h4>${user.first_name} ${user.last_name}</h4>
                <p>Welcome back!</p>
            `;
            
            userInfo.innerHTML = `
                <p><i class="fas fa-envelope"></i> ${user.email}</p>
                <p><i class="fas fa-phone"></i> ${user.phone || 'No phone number'}</p>
                <p><i class="fas fa-calendar-alt"></i> Member since ${new Date(user.created_at).toLocaleDateString()}</p>
            `;
            
            const fullName = `${user.first_name} ${user.last_name}`;
            avatar.setAttribute('title', fullName);
            avatar.setAttribute('aria-label', `${fullName}'s account menu`);
            
            userMenu.querySelectorAll('.user-name').forEach(element => {
                element.textContent = fullName;
            });
        }
    }
    
    // Function to handle logout
    function logout() {
        fetch('logout.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {

                    sessionStorage.removeItem('currentUser');
                    
                    updateUserInterface(false);
                    showSuccess('Logged out successfully.');
                } else {
                    showError('Logout failed. Please try again.', true);
                }
            })
            .catch(error => {
                console.error('Logout error:', error);
                showError('An error occurred during logout. Please try again.', true);
                
                sessionStorage.removeItem('currentUser');
                updateUserInterface(false);
            });
    }
    
    // Check authentication status on page load
    function checkAuthStatus() {
        document.body.classList.add('auth-loading');
        
        fetch('check_auth.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.isLoggedIn) {
              
                    updateUserInterface(true);
                    
                    
                    if (data.user) {
                        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                    }
                } else {
                    updateUserInterface(false);
                    
                    sessionStorage.removeItem('currentUser');
                }
                
                setTimeout(() => {
                    document.body.classList.remove('auth-loading');
                }, 50);
            })
            .catch(error => {
                console.error('Auth check error:', error);
                
                initializeAuthElements();
                
                setTimeout(() => {
                    document.body.classList.remove('auth-loading');
                }, 50);
            });
    }
    
    checkAuthStatus();

    // Helper functions
    function showError(message, isForm = false) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerText = message;
        
        if (isForm) {
            const signupModal = document.getElementById('signup-modal');
            const loginModal = document.getElementById('login-modal');
            
            if (signupModal && signupModal.style.display === 'block') {

                const modalContent = signupModal.querySelector('.modal-content');
                if (modalContent) {
                    errorDiv.style.position = 'relative';
                    errorDiv.style.top = '0';
                    errorDiv.style.right = '0';
                    errorDiv.style.margin = '10px 0';
                    modalContent.insertAdjacentElement('afterbegin', errorDiv);
                } else {
                   
                    document.body.appendChild(errorDiv);
                }
            } else if (loginModal && loginModal.style.display === 'block') {
              
                const modalContent = loginModal.querySelector('.modal-content');
                if (modalContent) {
                    errorDiv.style.position = 'relative';
                    errorDiv.style.top = '0';
                    errorDiv.style.right = '0';
                    errorDiv.style.margin = '10px 0';
                    modalContent.insertAdjacentElement('afterbegin', errorDiv);
                } else {
                    document.body.appendChild(errorDiv);
                }
            } else {
                document.body.appendChild(errorDiv);
            }
        } else {
            document.body.appendChild(errorDiv);
        }
        
        setTimeout(function() {
            errorDiv.classList.add('fade-out');
            setTimeout(function() {
                errorDiv.remove();
            }, 300);
        }, 5000);
    }

    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerText = message;
        document.body.appendChild(successDiv);
        
        setTimeout(function() {
            successDiv.classList.add('fade-out');
            setTimeout(function() {
                successDiv.remove();
            }, 300);
        }, 3000);
    }

    function showAvailableFlights() {
        // Get search parameters
        const departure = document.getElementById('departure').value;
        const destination = document.getElementById('destination').value;
        const departureDate = document.getElementById('departure-date').value;
        const passengers = document.getElementById('passengers').value;
        const flightsContainer = document.querySelector('.flights-container');
        
        flightsContainer.innerHTML = '<div class="loading-spinner"></div><p class="text-center">Searching for flights...</p>';
        
        const url = `fetch_flights.php?departure=${encodeURIComponent(departure)}&destination=${encodeURIComponent(destination)}&departureDate=${encodeURIComponent(departureDate)}&passengers=${encodeURIComponent(passengers)}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {

        flightsContainer.innerHTML = '';
        
                if (!data.success) {
                    // Show error if the request failed
                    showError(data.message || 'Failed to load flights');
                    return;
                }
                
                if (data.flights.length === 0) {
                    // Show message if no flights found
                    flightsContainer.innerHTML = `
                        <div class="no-flights">
                            <p>No flights found for your search criteria.</p>
                            <p>Please try different dates or destinations.</p>
                        </div>
                    `;
                    return;
                }
                
                // Generate flight cards with real data
                data.flights.forEach(flight => {
            const flightCard = document.createElement('div');
            flightCard.className = 'flight-card';
            flightCard.innerHTML = `
                <div class="flight-header">
                    <div class="airline">
                        <i class="fas fa-plane"></i>
                                <span>${flight.airline}</span>
                    </div>
                            <div class="flight-number">${flight.flight_number}</div>
                </div>
                <div class="flight-details">
                    <div class="flight-time">
                        <div class="departure">
                                    <h3>${flight.departure_time}</h3>
                                    <p>${capitalizeFirstLetter(flight.departure_city)}</p>
                        </div>
                        <div class="flight-duration">
                            <div class="duration-line">
                                <span class="plane-icon"><i class="fas fa-plane"></i></span>
                            </div>
                                    <p>${flight.duration}</p>
                        </div>
                        <div class="arrival">
                                    <h3>${flight.arrival_time}</h3>
                                    <p>${capitalizeFirstLetter(flight.destination_city)}</p>
                        </div>
                    </div>
                </div>
                <div class="flight-footer">
                            <div class="price">RM ${parseFloat(flight.price).toLocaleString()}</div>
                            <button class="select-flight-btn" data-flight-id="${flight.flight_id}">Select</button>
                </div>
            `;
            
            flightsContainer.appendChild(flightCard);
                });
        
        // Add event listeners to select flight buttons
        const selectButtons = document.querySelectorAll('.select-flight-btn');
        selectButtons.forEach(button => {
            button.addEventListener('click', function() {
                const flightId = this.getAttribute('data-flight-id');
                selectFlight(flightId);
            });
        });
            })
            .catch(error => {
                console.error('Error fetching flights:', error);
                showError('Failed to load flights. Please try again later.');
                flightsContainer.innerHTML = '<p class="text-center">An error occurred while loading flights.</p>';
            });
        
        // Show the flights section
        document.getElementById('flight-selection').classList.add('hidden');
        availableFlightsSection.classList.remove('hidden');
        window.scrollTo({ top: availableFlightsSection.offsetTop - 100, behavior: 'smooth' });
    }

    // Function to display flights in the available-flights section
    function displayFlights(data) {
        const availableFlightsSection = document.getElementById('available-flights');
        const flightsContainer = availableFlightsSection.querySelector('.flights-container');
        
        // Clear existing flights
        flightsContainer.innerHTML = '';
        
        if (data.success && data.flights && data.flights.length > 0) {
            // Show the available flights section
            availableFlightsSection.classList.remove('hidden');
            
            // Scroll to available flights section
            availableFlightsSection.scrollIntoView({ behavior: 'smooth' });
            
            // Get search criteria for display
            const departure = document.getElementById('departure').options[document.getElementById('departure').selectedIndex].text;
            const destination = document.getElementById('destination').options[document.getElementById('destination').selectedIndex].text;
            const departureDate = document.getElementById('departure-date').value;
            const travelClass = document.getElementById('class').value;
            const classDisplay = travelClass.charAt(0).toUpperCase() + travelClass.slice(1).replace('-', ' ');
            
            // Store all flight data in sessionStorage for later access
            sessionStorage.setItem('allFlights', JSON.stringify(data.flights));
            sessionStorage.setItem('departureCity', document.getElementById('departure').value);
            sessionStorage.setItem('destinationCity', document.getElementById('destination').value);
            sessionStorage.setItem('departureDate', departureDate);
            sessionStorage.setItem('class', travelClass);
            sessionStorage.setItem('adults', document.getElementById('adults').value || '1');
            sessionStorage.setItem('children', document.getElementById('children').value || '0');
            sessionStorage.setItem('infants', document.getElementById('infants').value || '0');

            // Update search criteria display
            const searchCriteria = availableFlightsSection.querySelector('.search-criteria');
            if (searchCriteria) {
                const formattedDate = formatDate(departureDate);
                searchCriteria.innerHTML = `
                    <h3>Available Flights</h3>
                    <p><strong>${departure}</strong> to <strong>${destination}</strong> on ${formattedDate} · ${classDisplay}</p>
                `;
            }
            
            // Add each flight to the container
            data.flights.forEach(flight => {
                const flightCard = document.createElement('div');
                flightCard.className = 'flight-card';
                
                const totalPrice = flight.price;
                
                flightCard.innerHTML = `
                    <div class="flight-info">
                        <div class="flight-number">
                            <i class="fas fa-plane"></i>
                            <span>${flight.flight_number}</span>
                        </div>
                        <div class="flight-route">
                            <div class="flight-city">
                                <h4>${departure}</h4>
                                <p>${flight.departure_time}</p>
                            </div>
                            <div class="flight-path">
                                <i class="fas fa-plane"></i>
                            </div>
                            <div class="flight-city">
                                <h4>${destination}</h4>
                                <p>${flight.arrival_time}</p>
                            </div>
                        </div>
                        <div class="flight-times">
                            <div>
                                <i class="far fa-clock"></i>
                                <span>Duration: ${flight.duration}</span>
                            </div>
                        </div>
                        <div class="flight-details">
                            <div class="flight-class">
                                <i class="fas fa-chair"></i>
                                <span>${classDisplay}</span>
                            </div>
                            <div class="available-seats">
                                <i class="fas fa-users"></i>
                                <span>${flight.available_seats} seats available</span>
                            </div>
                        </div>
                    </div>
                    <div class="flight-price">
                        <div class="price-amount">RM ${totalPrice.toFixed(2)}</div>
                        <div class="price-per-person">per person</div>
                        <button class="select-flight-btn" onclick="selectFlight(${flight.flight_id}, ${JSON.stringify(flight).replace(/"/g, '&quot;')})">
                            Select Flight
                        </button>
                    </div>
                `;
                
                flightsContainer.appendChild(flightCard);
            });
        } else {
            // For no flights found
            availableFlightsSection.classList.remove('hidden');
            flightsContainer.innerHTML = `
                <div class="no-flights">
                    <h3>No flights available</h3>
                    <p>We couldn't find any flights matching your search criteria.</p>
                    <p>Please try different dates or destinations.</p>
                </div>
            `;
        }
        
        // Hide loading overlay
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
    
    // Function to format dates
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Function to handle flight selection
    function selectFlight(flightId, flightData) {
        console.log("Selecting flight with ID:", flightId, "Data:", flightData);
        
        sessionStorage.setItem('selectedFlightId', flightId);
        
        if (typeof flightData === 'string') {
            try {
                flightData = JSON.parse(flightData);
            } catch (e) {
                console.error('Error parsing flight data:', e);
            }
        }
        
        // Store the complete flight object
        sessionStorage.setItem('selectedFlight', JSON.stringify(flightData));
        
        // Calculate and store price information
        const basePrice = flightData?.price || 200;
        const adults = parseInt(sessionStorage.getItem('adults') || '1');
        const children = parseInt(sessionStorage.getItem('children') || '0');
        const infants = parseInt(sessionStorage.getItem('infants') || '0');
        
        // Calculate fares
        const baseFare = (basePrice * adults) + (basePrice * 0.75 * children) + (basePrice * 0.1 * infants);
        const taxesValue = baseFare * 0.12; // 12% taxes
        const insuranceValue = 15 * (adults + children + infants); // Insurance per passenger
        const totalValue = baseFare + taxesValue + insuranceValue;
        
        // Store price information
        sessionStorage.setItem('baseFare', 'RM ' + baseFare.toFixed(2));
        sessionStorage.setItem('taxes', 'RM ' + taxesValue.toFixed(2));
        sessionStorage.setItem('insurance', 'RM ' + insuranceValue.toFixed(2));
        sessionStorage.setItem('totalAmount', 'RM ' + totalValue.toFixed(2));
        
        // Get city values from flightData if available, otherwise from form
        const departureCity = flightData?.departure_city || document.getElementById('departure').value;
        const destinationCity = flightData?.destination_city || document.getElementById('destination').value;
        
        // Get city display names
        const departureCityName = document.getElementById('departure').options[document.getElementById('departure').selectedIndex].text;
        const destinationCityName = document.getElementById('destination').options[document.getElementById('destination').selectedIndex].text;
        
        // Get other flight details
        const departureDate = document.getElementById('departure-date').value;
        const returnDate = document.getElementById('return-date')?.value || '';
        const tripType = document.querySelector('input[name="trip-type"]:checked').id;
        
        // Store the actual city values 
        sessionStorage.setItem('departureCity', departureCity);
        sessionStorage.setItem('destinationCity', destinationCity);
        sessionStorage.setItem('departureCityName', departureCityName);
        sessionStorage.setItem('destinationCityName', destinationCityName);
        
        // Also store with alternative keys for compatibility
        sessionStorage.setItem('departure', departureCity); 
        sessionStorage.setItem('destination', destinationCity); 
        sessionStorage.setItem('departureDate', departureDate);
        sessionStorage.setItem('returnDate', returnDate);
        sessionStorage.setItem('tripType', tripType);
        sessionStorage.setItem('class', document.getElementById('class').value);
        
        // Also store with flight prefix for backward compatibility
        sessionStorage.setItem('flightDeparture', departureCity);
        sessionStorage.setItem('flightDestination', destinationCity);
        sessionStorage.setItem('flightDepartureDate', departureDate);
        sessionStorage.setItem('flightReturnDate', returnDate);
        sessionStorage.setItem('flightTripType', tripType);
        sessionStorage.setItem('flightAdults', adults);
        sessionStorage.setItem('flightChildren', children);
        sessionStorage.setItem('flightInfants', infants);
        sessionStorage.setItem('flightClass', document.getElementById('class').value);
        
        // Store passenger counts 
        sessionStorage.setItem('adults', adults);
        sessionStorage.setItem('children', children);
        sessionStorage.setItem('infants', infants);
        sessionStorage.setItem('passengerCount', adults + children + infants);
        
        // Log the data for debugging
        console.log("Flight data stored in session:", {
            flightId,
            departureCity,
            destinationCity,
            departureCityName,
            destinationCityName,
            departureDate,
            returnDate,
            adults,
            children,
            infants,
            class: document.getElementById('class').value
        });
        
        // Hide the available flights section
        document.getElementById('available-flights').classList.add('hidden');
        
        // Show the passenger details section
        const passengerDetailsSection = document.getElementById('passenger-details');
        passengerDetailsSection.classList.remove('hidden');
        
        // Scroll to passenger details section
        passengerDetailsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update the passenger form based on total number of passengers
        const totalPassengers = parseInt(adults) + parseInt(children) + parseInt(infants);
        updatePassengerForm(totalPassengers);
    }

    // Make selectFlight available globally
    window.selectFlight = selectFlight;

    function updatePassengerForm(count) {
        console.log("Updating passenger form for", count, "passengers"); 
        
        const passengerForm = document.getElementById('passenger-form');
        const passengerCards = passengerForm.querySelectorAll('.passenger-card');
        
        for (let i = 1; i < passengerCards.length; i++) {
            passengerCards[i].remove();
        }
        
        const firstCard = passengerCards[0];
        const firstCardInputs = firstCard.querySelectorAll('input, select');
        firstCardInputs.forEach(input => {
            if (input.type === 'text' || input.type === 'date' || input.type === 'email' || input.type === 'tel') {
                input.value = '';
            } else if (input.type === 'select-one') {
                input.selectedIndex = 0;
            }
        });
        
        const contactInputs = document.querySelectorAll('.contact-details input');
        contactInputs.forEach(input => {
            input.value = '';
        });
        
        const adults = parseInt(sessionStorage.getItem('adults') || '1');
        const children = parseInt(sessionStorage.getItem('children') || '0');
        const infants = parseInt(sessionStorage.getItem('infants') || '0');
        
        console.log("Passenger counts - Adults:", adults, "Children:", children, "Infants:", infants); // Debug
        
        firstCard.querySelector('h3').textContent = `Passenger 1 (Adult)`;
        
        for (let i = 1; i < count; i++) {
            const newCard = firstCard.cloneNode(true);
            
            // Determine passenger type
            let passengerType = "Adult";
            if (i >= adults) {
                if (i < (adults + children)) {
                    passengerType = "Child";
                } else {
                    passengerType = "Infant";
                }
            }
            
            newCard.querySelector('h3').textContent = `Passenger ${i + 1} (${passengerType})`;
            
            // Reset values in the cloned card
            const newCardInputs = newCard.querySelectorAll('input, select');
            newCardInputs.forEach(input => {
                if (input.type === 'text' || input.type === 'date') {
                    input.value = '';
                } else if (input.type === 'select-one') {
                    input.selectedIndex = 0;
                }
            });
            
            // Update IDs for the new card (i+1 because i starts at 1)
            newCardInputs.forEach(input => {
                const originalId = input.id;
                const newId = `${originalId}-${i + 1}`;
                input.id = newId;
                const label = newCard.querySelector(`label[for="${originalId}"]`);
                if (label) {
                    label.setAttribute('for', newId);
                }
            });
            
            passengerForm.insertBefore(newCard, document.querySelector('.contact-details'));
        }
        
        // Create and add hidden input for selected flight ID if it doesn't exist
        if (!document.getElementById('selected-flight-id')) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'selected-flight-id';
            hiddenInput.value = sessionStorage.getItem('selectedFlightId') || '';
            passengerForm.appendChild(hiddenInput);
        }
        
        console.log("Passenger form updated"); 
    }

    function validatePassengerForm() {
        const passengerForm = document.getElementById('passenger-form');
        const requiredInputs = passengerForm.querySelectorAll('[required]');
        let isValid = true;
        
        // First validate all required fields
        requiredInputs.forEach(input => {
            if (!input.value) {
                input.style.borderColor = 'red';
                isValid = false;
            } else {
                input.style.borderColor = '';
            }
        });

        // Then validate email format
        const emailInput = document.getElementById('contact-email');
        if (emailInput && emailInput.value) {
            if (!validateEmail(emailInput.value)) {
                emailInput.style.borderColor = 'red';
                showError('Please enter a valid email address');
                isValid = false;
            } else {
                emailInput.style.borderColor = '';
            }
        }
        
        if (!isValid) {
            showError('Please fill in all required fields correctly');
            return false;
        }
        
        return true;
    }

    // Function to generate seat map
    function generateSeatMap() {

        const passengerCount = parseInt(document.getElementById('passengers').value || "1");
        const passengerList = document.querySelector('.passenger-list');
        
        console.log("Generating seat map for", passengerCount, "passengers"); // Debug
        
        passengerList.innerHTML = '';
        
        for (let i = 1; i <= passengerCount; i++) {

            let firstNameId = i === 1 ? 'firstName' : `firstName-${i}`;
            let lastNameId = i === 1 ? 'lastName' : `lastName-${i}`;
            
            const firstName = document.getElementById(firstNameId)?.value || 'Passenger';
            const lastName = document.getElementById(lastNameId)?.value || i;
            
            const passengerName = `${firstName} ${lastName}`;
            
            console.log(`Creating passenger item for ${passengerName}`); 
            
            const passengerItem = document.createElement('div');
            passengerItem.className = 'passenger-item';
            passengerItem.innerHTML = `
                <p>Passenger ${i}: <span id="passenger${i}-name">${passengerName}</span></p>
                <p>Selected Seat: <span id="passenger${i}-seat">Not selected</span></p>
            `;
            
            passengerList.appendChild(passengerItem);
        }
    
        // Function content to generate the seat map
        const seatMap = document.querySelector('.seats-grid');
        const rows = 10;
        const seatsPerRow = 6;
        
        // Clear existing seat map
        seatMap.innerHTML = '';
        
        // Get random occupied seats (simulating booked seats)
        const occupiedSeats = getRandomOccupiedSeats(rows, seatsPerRow);
        console.log(`Generated ${occupiedSeats.length} occupied seats out of ${rows * seatsPerRow} total seats`); // Debug
        
        // Generate seat map
        for (let row = 1; row <= rows; row++) {
            const rowLetter = String.fromCharCode(64 + row); // A, B, C, etc.
            
            for (let seat = 1; seat <= seatsPerRow; seat++) {
                const seatId = `${rowLetter}${seat}`;
                const isOccupied = occupiedSeats.includes(seatId);
                
                const seatElement = document.createElement('div');
                seatElement.className = `seat ${isOccupied ? 'occupied' : 'available'}`;
                seatElement.setAttribute('data-seat', seatId);
                seatElement.textContent = seatId;
                
                if (!isOccupied) {
                    seatElement.addEventListener('click', function() {
                        selectSeat(this);
                    });
                }
                
                seatMap.appendChild(seatElement);
                
                // Add aisle after seats 3 and 6
                if (seat === 3) {
                    const aisle = document.createElement('div');
                    aisle.className = 'aisle';
                    seatMap.appendChild(aisle);
                }
            }
        }
        
        // Reset the current passenger index for seat selection
        window.currentPassengerIndex = 0;
    }

    // Function to get random occupied seats
    function getRandomOccupiedSeats(rows, seatsPerRow) {
        const occupiedSeats = [];
        const totalSeats = rows * seatsPerRow;
        // Generate about 30% of seats as occupied
        const occupiedCount = Math.floor(totalSeats * 0.3); 
        
        for (let i = 0; i < occupiedCount; i++) {
            let seatId;
            do {
              
                const row = Math.floor(Math.random() * rows) + 1;
                const rowLetter = String.fromCharCode(64 + row); 
                
                const seat = Math.floor(Math.random() * seatsPerRow) + 1; 
                
                seatId = `${rowLetter}${seat}`;
            } while (occupiedSeats.includes(seatId));
            
            occupiedSeats.push(seatId);
        }
        
        console.log("Generated occupied seats:", occupiedSeats); 
        return occupiedSeats;
    }

    let currentPassengerIndex = 0;
    function selectSeat(seatElement) {
        const passengerCount = parseInt(document.getElementById('passengers').value || "1");
        const seatId = seatElement.getAttribute('data-seat');
        
        console.log(`Selecting seat ${seatId} for passenger index ${currentPassengerIndex}`); 
        
        // Check if seat is already selected
        if (seatElement.classList.contains('selected')) {
            seatElement.classList.remove('selected');
            
            // Find which passenger had this seat and update
            for (let i = 1; i <= passengerCount; i++) {
                const seatSpan = document.getElementById(`passenger${i}-seat`);
                if (seatSpan && seatSpan.textContent === seatId) {
                    seatSpan.textContent = 'Not selected';
                    console.log(`Removed seat ${seatId} from passenger ${i}`); 
                    break;
                }
            }
            return;
        }
        
        // If all passengers have seats, update the current one in rotation
        if (currentPassengerIndex >= passengerCount) {
            currentPassengerIndex = 0;
            console.log(`Reset passenger index to ${currentPassengerIndex}`); 
        }
        
        // Make sure we have a valid passenger element
        const passengerSeatElement = document.getElementById(`passenger${currentPassengerIndex + 1}-seat`);
        if (!passengerSeatElement) {
            console.error(`Can't find passenger element for index ${currentPassengerIndex + 1}`);
            return;
        }
        
        // Remove previous seat selection for this passenger if any
        const previousSeatId = passengerSeatElement.textContent;
        if (previousSeatId !== 'Not selected') {
            const previousSeat = document.querySelector(`[data-seat="${previousSeatId}"]`);
            if (previousSeat) {
                previousSeat.classList.remove('selected');
                console.log(`Removed selection from previous seat ${previousSeatId}`); // Debug
            }
        }
        
        // Update passenger's seat assignment
        passengerSeatElement.textContent = seatId;
        console.log(`Assigned seat ${seatId} to passenger ${currentPassengerIndex + 1}`); 
        
        // Add selected class to current seat
        seatElement.classList.add('selected');
        
        // Move to next passenger
        currentPassengerIndex++;
    }

    // Add event listener to the continue button in seat selection
    const seatSelectionContinueBtn = document.querySelector('.seat-selection .continue-btn');
    if (seatSelectionContinueBtn) {
        seatSelectionContinueBtn.addEventListener('click', function() {
            console.log("Continue button clicked in seat selection"); 
          
            const passengerCount = parseInt(document.getElementById('passengers').value || "1");
            console.log("Passenger count:", passengerCount); 
            let allSeatsSelected = true;
            
            for (let i = 1; i <= passengerCount; i++) {
                const seatElement = document.getElementById(`passenger${i}-seat`);
                console.log(`Checking seat for passenger ${i}:`, seatElement?.textContent); 
                if (seatElement && seatElement.textContent === 'Not selected') {
                    allSeatsSelected = false;
                    break;
                }
            }
            
            if (!allSeatsSelected) {
                showError('Please select seats for all passengers');
                return;
            }
            
            submitBooking();
        });
    }
    
    function submitBooking() {
        console.log("Submitting booking..."); 
        
        const selectedFlightId = sessionStorage.getItem('selectedFlightId');
        if (!selectedFlightId) {
            showError('No flight selected. Please select a flight first.');
            return;
        }
        
        if (!validatePassengerForm()) {
            return;
        }
        
        // Get passenger count - use the most reliable source
        const adults = parseInt(sessionStorage.getItem('adults') || '1');
        const children = parseInt(sessionStorage.getItem('children') || '0');
        const infants = parseInt(sessionStorage.getItem('infants') || '0');
        const passengerCount = adults + children + infants;
        
        // Get flight booking details - use the most reliable values
        const flightId = sessionStorage.getItem('selectedFlightId');
        const departureCity = sessionStorage.getItem('departureCity') || sessionStorage.getItem('departure');
        const destinationCity = sessionStorage.getItem('destinationCity') || sessionStorage.getItem('destination');
        const departureDate = sessionStorage.getItem('departureDate');
        const returnDate = sessionStorage.getItem('returnDate') || '';
        const tripType = sessionStorage.getItem('tripType') || 'one-way';
        const travelClass = sessionStorage.getItem('class') || 'economy';
        
        console.log('Submit booking with values:', {
            flightId,
            departureCity,
            destinationCity,
            departureDate, 
            returnDate,
            tripType,
            travelClass,
            adults,
            children,
            infants,
            passengerCount
        });
        
        // Get contact details
        const email = document.getElementById('contact-email').value;
        const phone = document.getElementById('contact-phone').value;
        
        // Save contact details to sessionStorage
        sessionStorage.setItem('contactEmail', email);
        sessionStorage.setItem('contactPhone', phone);
        
        // Collect passenger data
        const passengerData = [];
        let hasMissingPassengerInfo = false;
        
        for (let i = 1; i <= passengerCount; i++) {
            // Handle both single and multiple passenger forms
            const titleId = i === 1 ? 'title' : `title-${i}`;
            const firstNameId = i === 1 ? 'firstName' : `firstName-${i}`;
            const lastNameId = i === 1 ? 'lastName' : `lastName-${i}`;
            const dobId = i === 1 ? 'dob' : `dob-${i}`;
            const nationalityId = i === 1 ? 'nationality' : `nationality-${i}`;
            const idTypeId = i === 1 ? 'idType' : `idType-${i}`;
            const idNumberId = i === 1 ? 'idNumber' : `idNumber-${i}`;
            
            // Use safe element access with optional chaining and default values
            const title = document.getElementById(titleId)?.value || 'Mr';
            const firstName = document.getElementById(firstNameId)?.value || '';
            const lastName = document.getElementById(lastNameId)?.value || '';
            const dob = document.getElementById(dobId)?.value || '';
            const nationality = document.getElementById(nationalityId)?.value || '';
            const idType = document.getElementById(idTypeId)?.value || 'passport';
            const idNumber = document.getElementById(idNumberId)?.value || '';
            const seat = document.getElementById(`passenger${i}-seat`)?.textContent || 'Not assigned';
            
            // Determine passenger type based on stored values
            let type = 'Adult';
            if (i > adults) {
                if (i <= (adults + children)) {
                    type = 'Child';
                } else {
                    type = 'Infant';
                }
            }
            
            // Check for missing passenger details
            if (!firstName || !lastName || !dob || !nationality || !idNumber) {
                hasMissingPassengerInfo = true;
            }
            
            passengerData.push({
                title,
                firstName,
                lastName,
                dob,
                nationality,
                idType,
                idNumber,
                seat,
                type
            });
        }
        
        // Save passenger data to sessionStorage
        sessionStorage.setItem('passengerDetails', JSON.stringify(passengerData));
        
        // Validate passenger data
        if (hasMissingPassengerInfo) {
            showError('Some passenger information is missing. Please fill out all required passenger details.');
            console.error("Missing passenger information");
            return;
        }
        
        console.log("Passenger data:", passengerData);
        console.log("Contact info - Email:", email, "Phone:", phone);
        
        const formData = new FormData();
        formData.append('flightId', flightId);
        
        const actualDepartureCity = sessionStorage.getItem('departureCity') || sessionStorage.getItem('departure');
        const actualDestinationCity = sessionStorage.getItem('destinationCity') || sessionStorage.getItem('destination');
        
        formData.append('departure', actualDepartureCity);
        formData.append('destination', actualDestinationCity);
        
        console.log("Sending to server - cities:", { 
            departure: actualDepartureCity, 
            destination: actualDestinationCity 
        });
        
        formData.append('departureDate', departureDate);
        formData.append('returnDate', returnDate);
        formData.append('tripType', tripType);
        formData.append('passengerCount', passengerCount);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('class', travelClass);
        
        // Add passenger data
        for (let i = 0; i < passengerData.length; i++) {
            const passenger = passengerData[i];
            formData.append(`title_${i+1}`, passenger.title);
            formData.append(`firstName_${i+1}`, passenger.firstName);
            formData.append(`lastName_${i+1}`, passenger.lastName);
            formData.append(`dob_${i+1}`, passenger.dob);
            formData.append(`nationality_${i+1}`, passenger.nationality);
            formData.append(`idType_${i+1}`, passenger.idType);
            formData.append(`idNumber_${i+1}`, passenger.idNumber);
            formData.append(`seat_${i+1}`, passenger.seat);
            formData.append(`type_${i+1}`, passenger.type);
        }
        
        // Show loading indicator
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="loading-spinner"></div><p>Processing your booking...</p>';
        document.body.appendChild(loadingOverlay);
        
        // Make the fetch request to the server
        fetch('process_booking.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {

            document.body.removeChild(loadingOverlay);
            
            if (data.success) {
                console.log("Booking successful", data); 
                
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
 
                    const params = new URLSearchParams();
                    params.append('ref', data.bookingReference);
                    params.append('adminEmail', JSON.stringify(data.adminEmailStatus));
                    params.append('customerEmail', JSON.stringify(data.customerEmailStatus));
            
                    window.location.href = `confirmation.html?${params.toString()}`;
                }
            } else {
                console.error("Booking error:", data.message); 
                showError(data.message || 'There was an error processing your booking');
            }
        })
        .catch(error => {
            if (document.body.contains(loadingOverlay)) {
                document.body.removeChild(loadingOverlay);
            }
            
            console.error("Fetch error:", error); 
            showError('Network error. Please try again later.');
        });
    }

    function validateLoginForm() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email) {
            showError('Please enter your email', true);
            return false;
        }
        
        if (!validateEmail(email)) {
            showError('Please enter a valid email address', true);
            return false;
        }
        
        if (!password) {
            showError('Please enter your password', true);
            return false;
        }
        
        return true;
    }

    function validateSignupForm() {
        const firstname = document.getElementById('signup-firstname').value;
        const lastname = document.getElementById('signup-lastname').value;
        const email = document.getElementById('signup-email').value;
        const phone = document.getElementById('signup-phone').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const terms = document.getElementById('terms').checked;
        
        if (!firstname) {
            showError('Please enter your first name', true);
            return false;
        }
        
        if (!lastname) {
            showError('Please enter your last name', true);
            return false;
        }
        
        if (!email) {
            showError('Please enter your email', true);
            return false;
        }
        
        if (!validateEmail(email)) {
            showError('Please enter a valid email address', true);
            return false;
        }
        
        if (!phone) {
            showError('Please enter your phone number', true);
            return false;
        }
        
        if (!password) {
            showError('Please enter a password', true);
            return false;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters long', true);
            return false;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match', true);
            return false;
        }
        
        if (!terms) {
            showError('Please agree to the terms and conditions', true);
            return false;
        }
        
        return true;
    }

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Add passenger selection functionality
    const passengerToggle = document.getElementById('passenger-toggle');
    const passengerDropdown = document.querySelector('.passenger-dropdown');
    const incrementBtns = document.querySelectorAll('.increment-btn');
    const decrementBtns = document.querySelectorAll('.decrement-btn');
    const confirmBtn = document.querySelector('.confirm-passengers-btn');
    
    // Passenger counts
    let counts = {
        adults: 1,
        children: 0,
        infants: 0
    };
    
    // Max values for each passenger type
    const maxCounts = {
        adults: 9,
        children: 9,
        infants: 4
    };
    
    // Toggle dropdown
    if (passengerToggle) {
        passengerToggle.addEventListener('click', function() {
            passengerDropdown.classList.toggle('active');
        });
        
        // Close dropdown if clicked outside
        document.addEventListener('click', function(e) {
            if (!passengerToggle.contains(e.target) && !passengerDropdown.contains(e.target)) {
                passengerDropdown.classList.remove('active');
            }
        });
    }
    
    // Increment buttons
    if (incrementBtns) {
        incrementBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                
                if (counts[type] < maxCounts[type]) {
                    counts[type]++;
                    document.getElementById(`${type}-count`).textContent = counts[type];
                    document.getElementById(type).value = counts[type];
                    
                    const decrementBtn = document.querySelector(`.decrement-btn[data-type="${type}"]`);
                    decrementBtn.classList.remove('disabled');
                }
                
                updateTotalPassengers();
            });
        });
    }
    
    // Decrement buttons
    if (decrementBtns) {
        decrementBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                
                let minValue = 0;
                if (type === 'adults') minValue = 1; 
                
                if (counts[type] > minValue) {
                    counts[type]--;
                    document.getElementById(`${type}-count`).textContent = counts[type];
                    document.getElementById(type).value = counts[type];
                    
                    if (counts[type] === minValue) {
                        this.classList.add('disabled');
                    }
                }
                
                updateTotalPassengers();
            });
        });
    }
    
    // Initialize decrement buttons' state
    if (decrementBtns) {
        decrementBtns.forEach(btn => {
            const type = btn.getAttribute('data-type');
            let minValue = 0;
            if (type === 'adults') minValue = 1;
            
            const initialCount = parseInt(document.getElementById(type)?.value || counts[type]);
            counts[type] = initialCount;
            
            if (initialCount <= minValue) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        });
    }
    
    // Confirm button
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {

            const totalPassengers = counts.adults + counts.children + counts.infants;
            const travelClass = document.getElementById('travel-class').value;
            const travelClassDisplay = travelClass.charAt(0).toUpperCase() + travelClass.slice(1).replace('-', ' ');
            
            document.getElementById('passengers').value = totalPassengers;
            document.getElementById('class').value = travelClass;
            
            const passengerText = totalPassengers === 1 ? 'Adult' : 'Passengers';
            document.querySelector('.passenger-summary').textContent = 
                `${totalPassengers} ${passengerText}, ${travelClassDisplay}`;
            
            passengerDropdown.classList.remove('active');
        });
    }
    
    // Update total passengers hidden input
    function updateTotalPassengers() {
        const total = counts.adults + counts.children + counts.infants;
        document.getElementById('passengers').value = total;
    }

    // Add event listener to the continue button in the passenger details section
    const continueToSeatBtn = document.querySelector('.passenger-details .continue-btn');
    if (continueToSeatBtn) {
        continueToSeatBtn.addEventListener('click', function() {
            if (!validatePassengerForm()) {
                return;
            }
            
            const passengerCount = parseInt(sessionStorage.getItem('flightAdults') || '1') + 
                                 parseInt(sessionStorage.getItem('flightChildren') || '0') + 
                                 parseInt(sessionStorage.getItem('flightInfants') || '0');
            
            const email = document.getElementById('contact-email').value;
            const phone = document.getElementById('contact-phone').value;
            
            sessionStorage.setItem('contactEmail', email);
            sessionStorage.setItem('contactPhone', phone);
            
            const passengerData = [];
            
            for (let i = 1; i <= passengerCount; i++) {
                // Handle both single and multiple passenger forms
                const titleId = i === 1 ? 'title' : `title-${i}`;
                const firstNameId = i === 1 ? 'firstName' : `firstName-${i}`;
                const lastNameId = i === 1 ? 'lastName' : `lastName-${i}`;
                const dobId = i === 1 ? 'dob' : `dob-${i}`;
                const nationalityId = i === 1 ? 'nationality' : `nationality-${i}`;
                const idTypeId = i === 1 ? 'idType' : `idType-${i}`;
                const idNumberId = i === 1 ? 'idNumber' : `idNumber-${i}`;
                
                // Use safe element access with optional chaining and default values
                const title = document.getElementById(titleId)?.value || 'Mr';
                const firstName = document.getElementById(firstNameId)?.value || '';
                const lastName = document.getElementById(lastNameId)?.value || '';
                const dob = document.getElementById(dobId)?.value || '';
                const nationality = document.getElementById(nationalityId)?.value || '';
                const idType = document.getElementById(idTypeId)?.value || 'passport';
                const idNumber = document.getElementById(idNumberId)?.value || '';
                
                // Determine passenger type based on stored values
                let type = 'Adult';
                if (i > parseInt(sessionStorage.getItem('flightAdults') || '1')) {
                    if (i <= (parseInt(sessionStorage.getItem('flightAdults') || '1') + parseInt(sessionStorage.getItem('flightChildren') || '0'))) {
                        type = 'Child';
                    } else {
                        type = 'Infant';
                    }
                }
                
                passengerData.push({
                    title,
                    firstName,
                    lastName,
                    dob,
                    nationality,
                    idType,
                    idNumber,
                    seat: 'Not assigned',
                    type
                });
            }
            
            sessionStorage.setItem('passengerDetails', JSON.stringify(passengerData));
            
            document.getElementById('passenger-details').classList.add('hidden');
            
            const seatSelectionSection = document.getElementById('seat-selection');
            seatSelectionSection.classList.remove('hidden');
            
            seatSelectionSection.scrollIntoView({ behavior: 'smooth' });
            
            generateSeatMap();
        });
    }

    // Add event listener to the back button in seat selection
    const backToPassengerBtn = document.querySelector('.seat-selection .back-btn');
    if (backToPassengerBtn) {
        backToPassengerBtn.addEventListener('click', function() {

            document.getElementById('seat-selection').classList.add('hidden');
            
            const passengerDetailsSection = document.getElementById('passenger-details');
            passengerDetailsSection.classList.remove('hidden');
            
            passengerDetailsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Add event listener to the continue button in seat selection section to process the booking
    const continueToPaymentBtn = document.querySelector('.seat-selection .continue-btn');
    if (continueToPaymentBtn) {
        console.log("continueToPaymentBtn is the same as seatSelectionContinueBtn - no second listener needed");
    }

    const destinationsTrack = document.querySelector('.destinations-track');
    const sliderDots = document.querySelector('.slider-dots');
    
    if (!destinationsTrack) return; 
    
    const cards = Array.from(destinationsTrack.querySelectorAll('.destination-card'));
    const cardCount = cards.length;
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    let currentIndex = 0;
    let slideWidth;
    let visibleSlides;
    let autoSlideInterval;
    let isAnimating = false;
    const autoSlideDelay = 3000; // For adjust the seconds between slides
    
    // Calculate how many slides to show based on screen width
    function calculateSlidesVisible() {
        const windowWidth = window.innerWidth;
        if (windowWidth >= 1200) {
            return 3;
        } else if (windowWidth >= 768) {
            return 2;
        } else {
            return 1;
        }
    }
    
    // Clone items for infinite loop
    function setupInfiniteLoop() {

        destinationsTrack.querySelectorAll('.destination-card.clone').forEach(clone => clone.remove());
        
        const numClones = visibleSlides * 2;
        
        for (let i = 0; i < numClones; i++) {
            const clone = cards[i % cardCount].cloneNode(true);
            clone.classList.add('clone');
            destinationsTrack.appendChild(clone);
        }
        
        for (let i = cardCount - numClones; i < cardCount; i++) {
            const clone = cards[i % cardCount].cloneNode(true);
            clone.classList.add('clone');
            destinationsTrack.insertBefore(clone, destinationsTrack.firstChild);
        }
        
        currentIndex = numClones;
        updateSliderPosition(false);
    }
    
    // Initialize the slider
    function initSlider() {
        visibleSlides = calculateSlidesVisible();
        
        setupInfiniteLoop();
        
        const allSlides = destinationsTrack.querySelectorAll('.destination-card');
        
        slideWidth = destinationsTrack.clientWidth / visibleSlides;
        
        allSlides.forEach(card => {
            card.style.width = `${slideWidth - 25}px`; 
        });
        
        // Dot indicators
        sliderDots.innerHTML = '';
        const totalDots = Math.ceil(cardCount / visibleSlides);
        
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            sliderDots.appendChild(dot);
        }
        
        updateActiveDot();
        startAutoSlide();
    }
    
    // Update active dot based on current index
    function updateActiveDot() {
        const realIndex = getRealIndex();
        const activeDotIndex = Math.floor(realIndex / visibleSlides);
        
        const dots = sliderDots.querySelectorAll('.slider-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === activeDotIndex);
        });
    }
    
    // Get the index of the real slides (not clones)
    function getRealIndex() {
        // All slides including clones
        const allSlides = destinationsTrack.querySelectorAll('.destination-card');
        const numClones = visibleSlides * 2;
        
        // Adjust index to account for prepended clones
        let realIndex = (currentIndex - numClones) % cardCount;
        if (realIndex < 0) realIndex += cardCount;
        return realIndex;
    }
    
    // Move the slider to show the current index
    function updateSliderPosition(animate = true) {
   
        const allSlides = destinationsTrack.querySelectorAll('.destination-card');
        
        const translateValue = -currentIndex * slideWidth;
    
        // Apply transition only when animating
        destinationsTrack.style.transition = animate ? 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
        destinationsTrack.style.transform = `translateX(${translateValue}px)`;
        
        // Add animation effects to visible cards
        const startVisible = currentIndex;
        const endVisible = currentIndex + visibleSlides - 1;
        
        allSlides.forEach((card, i) => {
            // Reset all cards first
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
            
            if (i >= startVisible && i <= endVisible) {
                // Current visible cards
                const distanceFromCenter = Math.abs((i - startVisible) - (visibleSlides - 1) / 2);
                const scale = 1 - (distanceFromCenter * 0.03);
                card.style.transform = `scale(${scale})`;
                card.style.zIndex = 50 - distanceFromCenter;
            } else {
                // Off-screen cards
                card.style.opacity = card.classList.contains('clone') ? '0.5' : '0.8';
                card.style.transform = 'scale(0.95)';
                card.style.zIndex = 1;
            }
        });
        
        updateActiveDot();
    }
    
    // Handle transition end for infinite loop effect
    function handleTransitionEnd() {
        const numClones = visibleSlides * 2;
        const totalSlides = destinationsTrack.querySelectorAll('.destination-card').length;
        
        if (currentIndex < numClones) {
            currentIndex = totalSlides - (2 * numClones) + currentIndex;
            updateSliderPosition(false);
        }

        else if (currentIndex >= totalSlides - numClones) {
            currentIndex = numClones + (currentIndex - (totalSlides - numClones));
            updateSliderPosition(false);
        }
        
        isAnimating = false;
    }
    
    // Go to previous slide
    function goToPrevSlide() {
        if (isAnimating) return;
        isAnimating = true;
        
        currentIndex = Math.max(currentIndex - 1, 0);
        updateSliderPosition();
        resetAutoSlide();
    }
    
    // Go to next slide
    function goToNextSlide() {
        if (isAnimating) return;
        isAnimating = true;
        
        const totalSlides = destinationsTrack.querySelectorAll('.destination-card').length;
        currentIndex = Math.min(currentIndex + 1, totalSlides - visibleSlides);
        updateSliderPosition();
        resetAutoSlide();
    }
    
    // Go to specific slide (for dot navigation)
    function goToSlide(dotIndex) {
        if (isAnimating) return;
        isAnimating = true;
        
        const numClones = visibleSlides * 2;
        currentIndex = numClones + (dotIndex * visibleSlides);
        updateSliderPosition();
        resetAutoSlide();
    }
    
    // Start automatic sliding
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(goToNextSlide, autoSlideDelay);
    }
    
    // Stop automatic sliding
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }
    
    // Reset auto slide timer when user interacts
    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }
    
    // Add event listeners
    if (prevBtn) prevBtn.addEventListener('click', goToPrevSlide);
    if (nextBtn) nextBtn.addEventListener('click', goToNextSlide);
    destinationsTrack.addEventListener('transitionend', handleTransitionEnd);
    
    // Enhanced interactivity - dragging functionality
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    
    function dragStart(e) {
        if (isAnimating) return;
        stopAutoSlide();
        
        const event = e.type.includes('mouse') ? e : e.touches[0];
        startPos = event.clientX;
        isDragging = true;
        
        // Get current transform value
        const transform = window.getComputedStyle(destinationsTrack).getPropertyValue('transform');
        const matrix = new WebKitCSSMatrix(transform);
        currentTranslate = matrix.m41;
        prevTranslate = currentTranslate;
        
        destinationsTrack.style.transition = 'none';
        
        // Add event listeners for move and end
        window.addEventListener('mousemove', drag);
        window.addEventListener('touchmove', drag, { passive: true });
        window.addEventListener('mouseup', dragEnd);
        window.addEventListener('touchend', dragEnd);
        
        // Prevent default behavior (scroll/click)
        if (e.type.includes('mouse')) {
            e.preventDefault();
        }
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const event = e.type.includes('mouse') ? e : e.touches[0];
        const currentPosition = event.clientX;
        const diff = currentPosition - startPos;
        
        currentTranslate = prevTranslate + diff;
        destinationsTrack.style.transform = `translateX(${currentTranslate}px)`;
    }
    
    function dragEnd() {
        isDragging = false;
        
        const movedPercentage = (currentTranslate - prevTranslate) / (slideWidth * visibleSlides);
        
        // If moved more than 15% of slide width, move to next/prev slide
        if (movedPercentage < -0.15) {
            goToNextSlide();
        } else if (movedPercentage > 0.15) {
            goToPrevSlide();
        } else {
            // Return to original position
            updateSliderPosition();
        }
        
        startAutoSlide();
        
        // Remove event listeners
        window.removeEventListener('mousemove', drag);
        window.removeEventListener('touchmove', drag);
        window.removeEventListener('mouseup', dragEnd);
        window.removeEventListener('touchend', dragEnd);
    }
    
    // Add drag event listeners
    destinationsTrack.addEventListener('mousedown', dragStart);
    destinationsTrack.addEventListener('touchstart', dragStart, { passive: true });
    
    // Pause auto-sliding when hovering over the slider
    destinationsTrack.addEventListener('mouseenter', stopAutoSlide);
    destinationsTrack.addEventListener('mouseleave', startAutoSlide);
    
    // Handle touch events for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;
    
    destinationsTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    destinationsTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
  
            goToNextSlide();
        }
        if (touchEndX > touchStartX + swipeThreshold) {
     
            goToPrevSlide();
        }
    }
    
    // Initialize on load
    initSlider();
    
    // Reinitialize on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initSlider();
        }, 250);
    });
    
    // 3D tilt effect for destination cards
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            if (isDragging) return; // Skip tilt effect if currently dragging
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angleX = (y - centerY) / 25;
            const angleY = (centerX - x) / 25;
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Shine effect
            const shine = card.querySelector('.shine-effect') || document.createElement('div');
            if (!card.querySelector('.shine-effect')) {
                shine.classList.add('shine-effect');
                shine.style.position = 'absolute';
                shine.style.top = '0';
                shine.style.left = '0';
                shine.style.right = '0';
                shine.style.bottom = '0';
                shine.style.background = 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%)';
                shine.style.opacity = '0';
                shine.style.transition = 'opacity 0.3s ease';
                shine.style.pointerEvents = 'none';
                shine.style.zIndex = '10';
                card.appendChild(shine);
            }

            const shineX = ((x / rect.width) * 100);
            const shineY = ((y / rect.height) * 100);
            shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 80%)`;
            shine.style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            
            // Remove shine effect
            const shine = card.querySelector('.shine-effect');
            if (shine) shine.style.opacity = '0';
            
            setTimeout(() => {
                if (!card.matches(':hover')) {
                    card.style.transform = '';
                }
            }, 100);
        });
    });

    // Start destination slider functionality
    if (document.querySelector('.destinations-slider')) {
        const destinationsTrack = document.querySelector('.destinations-track');
        const cards = document.querySelectorAll('.destination-card:not(.clone)');
        const cardCount = cards.length;
        const sliderDots = document.querySelector('.slider-dots');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        
        let currentIndex = 0;
        let slideWidth;
        let visibleSlides;
        let autoSlideInterval;
        let isAnimating = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let isDragging = false;
        const autoSlideDelay = 5000; // For adjust seconds between slides
        
        // Calculate how many slides to show based on screen width
        function calculateSlidesVisible() {
            const windowWidth = window.innerWidth;
            if (windowWidth >= 1200) {
                return 3;
            } else if (windowWidth >= 768) {
                return 2;
            } else {
                return 1;
            }
        }
        
        // Clone items for infinite loop
        function setupInfiniteLoop() {
            // Remove any existing clones
            destinationsTrack.querySelectorAll('.destination-card.clone').forEach(clone => clone.remove());
            
            // Clone the first and last few slides for smooth looping
            const numClones = visibleSlides * 2;
            
            // Clone beginning slides and add to end
            for (let i = 0; i < numClones; i++) {
                const clone = cards[i % cardCount].cloneNode(true);
                clone.classList.add('clone');
                destinationsTrack.appendChild(clone);
            }
            
            // Clone ending slides and add to beginning
            for (let i = cardCount - numClones; i < cardCount; i++) {
                const clone = cards[i % cardCount].cloneNode(true);
                clone.classList.add('clone');
                destinationsTrack.insertBefore(clone, destinationsTrack.firstChild);
            }
            
            currentIndex = numClones;
            updateSliderPosition(false);
        }
        
        // Initialize the slider
        function initSlider() {
            visibleSlides = calculateSlidesVisible();
            
            setupInfiniteLoop();
            
            const allSlides = destinationsTrack.querySelectorAll('.destination-card');
            
            slideWidth = destinationsTrack.clientWidth / visibleSlides;
            
            allSlides.forEach(card => {
                card.style.width = `${slideWidth - 25}px`; // Subtract the gap
                
                // Mouse move event for 3D tilt effect
                card.addEventListener('mousemove', handleCardTilt);
                card.addEventListener('mouseleave', resetCardTilt);
                
                // Shine effect on hover
                const img = card.querySelector('.destination-img');
                if (img) {
                    img.addEventListener('mousemove', handleShineEffect);
                    img.addEventListener('mouseleave', removeShineEffect);
                }
            });
            
            // Dot indicators
            sliderDots.innerHTML = '';
            const totalDots = Math.ceil(cardCount / visibleSlides);
            
            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('div');
                dot.classList.add('slider-dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                sliderDots.appendChild(dot);
            }
            
            updateActiveDot();
            startAutoSlide();
        }
        
        // 3D tilt effect on mouse move
        function handleCardTilt(e) {
            const card = e.currentTarget;
            const cardRect = card.getBoundingClientRect();
            const centerX = cardRect.left + cardRect.width / 2;
            const centerY = cardRect.top + cardRect.height / 2;
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Calculate tilt based on mouse position
            const tiltX = (centerY - mouseY) / 10;
            const tiltY = (mouseX - centerX) / 10;
            
            // Apply the tilt effect with perspective
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        }
        
        // Reset tilt when mouse leaves
        function resetCardTilt(e) {
            const card = e.currentTarget;
            card.style.transform = '';
        }
        
        // Add shine effect on hover
        function handleShineEffect(e) {
            const img = e.currentTarget;
            
            // Remove any existing shine element
            let shine = img.querySelector('.shine-effect');
            if (!shine) {
                shine = document.createElement('div');
                shine.classList.add('shine-effect');
                shine.style.position = 'absolute';
                shine.style.top = '0';
                shine.style.left = '0';
                shine.style.right = '0';
                shine.style.bottom = '0';
                shine.style.background = 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)';
                shine.style.transformOrigin = 'center';
                shine.style.pointerEvents = 'none';
                shine.style.zIndex = '10';
                img.appendChild(shine);
            }
            
            // Update shine position based on mouse
            const rect = img.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const percentX = x / rect.width * 100;
            const percentY = y / rect.height * 100;
            
            shine.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)`;
        }
        
        // Remove shine effect
        function removeShineEffect(e) {
            const img = e.currentTarget;
            const shine = img.querySelector('.shine-effect');
            if (shine) {
                shine.remove();
            }
        }
        
        // Update active dot based on current index
        function updateActiveDot() {
            const realIndex = getRealIndex();
            const activeDotIndex = Math.floor(realIndex / visibleSlides);
            
            const dots = sliderDots.querySelectorAll('.slider-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === activeDotIndex);
            });
        }
        
        // Get the index of the real slides (not clones)
        function getRealIndex() {
  
            const allSlides = destinationsTrack.querySelectorAll('.destination-card');
            const numClones = visibleSlides * 2;
            
            let realIndex = (currentIndex - numClones) % cardCount;
            if (realIndex < 0) realIndex += cardCount;
            return realIndex;
        }
        
        function updateSliderPosition(animate = true) {
        
            const allSlides = destinationsTrack.querySelectorAll('.destination-card');
            
            const translateValue = -currentIndex * slideWidth;
            currentTranslate = translateValue; 
            
            destinationsTrack.style.transition = animate ? 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
            destinationsTrack.style.transform = `translateX(${translateValue}px)`;
            
            const startVisible = currentIndex;
            const endVisible = currentIndex + visibleSlides - 1;
            
            allSlides.forEach((card, i) => {
                // Reset all cards first
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                
                if (i >= startVisible && i <= endVisible) {
                    // Current visible cards
                    const distanceFromCenter = Math.abs((i - startVisible) - (visibleSlides - 1) / 2);
                    const scale = 1 - (distanceFromCenter * 0.03);
                    card.style.transform = `scale(${scale})`;
                    card.style.zIndex = 50 - distanceFromCenter;
                } else {
                    // Off-screen cards
                    card.style.opacity = card.classList.contains('clone') ? '0.5' : '0.8';
                    card.style.transform = 'scale(0.95)';
                    card.style.zIndex = 1;
                }
            });
            
            updateActiveDot();
        }
        
        // Handle transition end for infinite loop effect
        function handleTransitionEnd() {
            const numClones = visibleSlides * 2;
            const totalSlides = destinationsTrack.querySelectorAll('.destination-card').length;
            
            // If scrolled to the cloned slides at the beginning
            if (currentIndex < numClones) {
                currentIndex = totalSlides - (2 * numClones) + currentIndex;
                updateSliderPosition(false);
            }
            // If scrolled to the cloned slides at the end
            else if (currentIndex >= totalSlides - numClones) {
                currentIndex = numClones + (currentIndex - (totalSlides - numClones));
                updateSliderPosition(false);
            }
            
            isAnimating = false;
        }
        
        // Go to previous slide
        function goToPrevSlide() {
            if (isAnimating) return;
            isAnimating = true;
            
            currentIndex = Math.max(currentIndex - 1, 0);
            updateSliderPosition();
            resetAutoSlide();
        }
        
        // Go to next slide
        function goToNextSlide() {
            if (isAnimating) return;
            isAnimating = true;
            
            const totalSlides = destinationsTrack.querySelectorAll('.destination-card').length;
            currentIndex = Math.min(currentIndex + 1, totalSlides - visibleSlides);
            updateSliderPosition();
            resetAutoSlide();
        }
        
        // Go to specific slide (for dot navigation)
        function goToSlide(dotIndex) {
            if (isAnimating) return;
            isAnimating = true;
            
            const numClones = visibleSlides * 2;
            currentIndex = numClones + (dotIndex * visibleSlides);
            updateSliderPosition();
            resetAutoSlide();
        }
        
        // Start automatic sliding
        function startAutoSlide() {
            stopAutoSlide();
            autoSlideInterval = setInterval(goToNextSlide, autoSlideDelay);
        }
        
        // Stop automatic sliding
        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
            }
        }
        
        // Reset auto slide timer
        function resetAutoSlide() {
            stopAutoSlide();
            startAutoSlide();
        }
        
        // Add touch/mouse drag functionality
        function dragStart(e) {
            if (isAnimating) return;
            
            destinationsTrack.style.transition = 'none';
            stopAutoSlide();
            
            startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            isDragging = true;
            prevTranslate = currentTranslate;
            
            // Prevent default behavior
            if (e.type === 'touchstart') {
                e.preventDefault();
            }
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            // Current position
            const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            // Difference from start position
            const diff = currentPosition - startPos;
            
            // Apply drag movement
            currentTranslate = prevTranslate + diff;
            destinationsTrack.style.transform = `translateX(${currentTranslate}px)`;
        }
        
        function dragEnd() {
            if (!isDragging) return;
            isDragging = false;
            
            // Distance moved
            const movedBy = currentTranslate - prevTranslate;
            
            // If moved significantly (more than 20% of slide width), change slide
            if (Math.abs(movedBy) > slideWidth * 0.2) {
                if (movedBy > 0) {
                    goToPrevSlide();
                } else {
                    goToNextSlide();
                }
            } else {
                // Revert to current slide
                updateSliderPosition(true);
            }
            
            startAutoSlide();
        }
        
        // Handle swipe
        function handleSwipe() {
            let touchStartX = 0;
            let touchEndX = 0;
            
            destinationsTrack.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            destinationsTrack.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipeGesture();
            }, { passive: true });
            
            function handleSwipeGesture() {
                const swipeThreshold = 50; // Minimum distance for swipe
                
                if (touchEndX < touchStartX - swipeThreshold) {
                    goToNextSlide(); // Swipe left
                }
                
                if (touchEndX > touchStartX + swipeThreshold) {
                    goToPrevSlide(); // Swipe right
                }
            }
        }
        
        // Event listeners
        prevBtn.addEventListener('click', goToPrevSlide);
        nextBtn.addEventListener('click', goToNextSlide);
        destinationsTrack.addEventListener('transitionend', handleTransitionEnd);
        
        // Mouse and touch events for dragging
        destinationsTrack.addEventListener('mousedown', dragStart);
        destinationsTrack.addEventListener('touchstart', dragStart, { passive: true });
        window.addEventListener('mousemove', drag);
        window.addEventListener('touchmove', drag, { passive: true });
        window.addEventListener('mouseup', dragEnd);
        window.addEventListener('touchend', dragEnd);
        window.addEventListener('mouseleave', dragEnd);
        
        // Handle swipe on mobile
        handleSwipe();
        
        // Initialize on load and resize
        window.addEventListener('load', initSlider);
        window.addEventListener('resize', () => {
            const newVisibleSlides = calculateSlidesVisible();
            if (newVisibleSlides !== visibleSlides) {
                initSlider(); 
            } else {
                // Just update slide width and positions
                slideWidth = destinationsTrack.clientWidth / visibleSlides;
                updateSliderPosition(false);
            }
        });
 
        initSlider();
    }

    initPlaneSlideshow();
    
    initPromotionAnimations();
    
    initOffersSlider();
    
    initTravelTips();

    // Process forgot password form
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const forgotEmail = document.getElementById('forgot-email').value;
            
            if (!forgotEmail) {
                showError('Please enter your email address', true);
                return;
            }
            
            if (!validateEmail(forgotEmail)) {
                showError('Please enter a valid email address', true);
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Processing...';
            submitBtn.disabled = true;
            
            // Send the request to the server
            const formData = new FormData();
            formData.append('email', forgotEmail);
            
            fetch('forgot_password.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                
                if (data.success) {
                    showSuccess(data.message);
                    
                    // Close the forgot password modal
                    forgotPasswordModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    
                    setTimeout(() => {
                    
                        document.getElementById('reset-email').value = forgotEmail;                      
                        document.getElementById('reset-token').value = 'fake_token_' + Date.now();
                        resetPasswordModal.style.display = 'block';
                    }, 3000);
                } else {
                    
                    showError(data.message || 'An error occurred. Please try again.', true);
                }
            })
            .catch(error => {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                showError('An error occurred. Please try again later.', true);
                console.error('Forgot password error:', error);
            });
        });
    }
    
    // Process reset password form
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const resetEmail = document.getElementById('reset-email').value;
            const resetPassword = document.getElementById('reset-password').value;
            const resetConfirmPassword = document.getElementById('reset-confirm-password').value;
            const resetToken = document.getElementById('reset-token').value;
            
            if (!resetEmail || !validateEmail(resetEmail)) {
                showError('Please enter a valid email address', true);
                return;
            }
            
            if (!resetPassword) {
                showError('Please enter a new password', true);
                return;
            }
            
            if (resetPassword.length < 6) {
                showError('Password must be at least 6 characters long', true);
                return;
            }
            
            if (resetPassword !== resetConfirmPassword) {
                showError('Passwords do not match', true);
                return;
            }
            
   
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Saving...';
            submitBtn.disabled = true;
            
            // Send the request to the server
            const formData = new FormData();
            formData.append('email', resetEmail);
            formData.append('password', resetPassword);
            formData.append('confirm_password', resetConfirmPassword);
            formData.append('token', resetToken);
            
            fetch('reset_password.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                
                if (data.success) {
                 
                    showSuccess(data.message);
                    
                    // Close the reset password modal
                    resetPasswordModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    
                    // After a delay, show the login modal
                    setTimeout(() => {
                        loginModal.style.display = 'block';
                    }, 3000);
                } else {
                  
                    showError(data.message || 'An error occurred. Please try again.', true);
                }
            })
            .catch(error => {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                showError('An error occurred. Please try again later.', true);
                console.error('Reset password error:', error);
            });
        });
    }

    document.getElementById('passenger-continue').addEventListener('click', function() {
        if (validatePassengerForm()) {
            // Save passenger details to session storage
            const passengerForm = document.getElementById('passenger-form');
            const formData = new FormData(passengerForm);
            const passengerDetails = {};
            formData.forEach((value, key) => {
                passengerDetails[key] = value;
            });
            sessionStorage.setItem('passengerDetails', JSON.stringify(passengerDetails));
            
            // Hide passenger details and show seat selection
            document.getElementById('passenger-details').style.display = 'none';
            document.getElementById('seat-selection').style.display = 'block';
            
            // Scroll to seat selection
            document.getElementById('seat-selection').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

/**
 * Hero Section Plane Slideshow
 */
function initPlaneSlideshow() {
    const slides = document.querySelectorAll('.plane-slide');
    let currentIndex = 0;
    let interval;
    let imagesLoaded = 0;
    const totalImages = slides.length;
    
    // Preload images to ensure they display correctly
    function preloadImages() {
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
              
                const tempImg = new Image();
                tempImg.src = img.src;
                tempImg.onload = () => {
                    imagesLoaded++;
                    if (imagesLoaded === totalImages) {
                     
                        startSlideshow();
                       
                        document.querySelector('.plane-slideshow').classList.add('loaded');
                    }
                };
                tempImg.onerror = () => {
                    console.error('Failed to load image:', img.src);
                    imagesLoaded++;
                };
            }
        });
    }
    
    // Function to show a specific slide
    function showSlide(index) {
      
        slides.forEach(slide => {
            slide.classList.remove('active', 'prev', 'next');
        });
        
        const prevIndex = (index - 1 + slides.length) % slides.length;
        const nextIndex = (index + 1) % slides.length;
        
        slides[prevIndex].classList.add('prev');
        slides[index].classList.add('active');
        slides[nextIndex].classList.add('next');
        
        currentIndex = index;
    }
    
    // Function to advance to the next slide
    function nextSlide() {
        showSlide((currentIndex + 1) % slides.length);
    }
    
    // Function to go to the previous slide
    function prevSlide() {
        showSlide((currentIndex - 1 + slides.length) % slides.length);
    }
    
    // Function to start the automatic slideshow
    function startSlideshow() {
        // Show first slide immediately
        showSlide(0);
        
        // Start rotation after delay
        setTimeout(() => {
            interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        }, 1000);
    }
    
    // Function to reset the interval
    function resetInterval() {
        clearInterval(interval);
        interval = setInterval(nextSlide, 5000);
    }
    
    // Add 3D effect on mouse movement
    const heroSection = document.querySelector('.hero-section');
    
    heroSection.addEventListener('mousemove', function(e) {
        if (window.innerWidth <= 768) return; // Skip on mobile
        
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        
        const activeSlide = document.querySelector('.plane-slide.active');
        if (activeSlide) {
            activeSlide.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) scale(1.05)`;
        }
    });
    
    // Reset transform on mouse leave
    heroSection.addEventListener('mouseleave', function() {
        const activeSlide = document.querySelector('.plane-slide.active');
        if (activeSlide) {
            activeSlide.style.transform = '';
            // Restart the float animation
            void activeSlide.offsetWidth; // Trigger reflow
            activeSlide.style.animation = 'none';
            setTimeout(() => {
                activeSlide.style.animation = 'plane-float 6s ease-in-out infinite';
            }, 10);
        }
    });
    
    // Add swipe functionality for touch devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    heroSection.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    heroSection.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, { passive: true });
    
    function handleSwipeGesture() {
        const swipeThreshold = 50; // Minimum distance for swipe
        
        if (touchEndX < touchStartX - swipeThreshold) {
            nextSlide(); // Swipe left
            resetInterval();
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            prevSlide(); // Swipe right
            resetInterval();
        }
    }
    
    preloadImages();
}

/**
 * Initialize animation effects for promotion cards
 */
function initPromotionAnimations() {
    const promotionCards = document.querySelectorAll('.promotion-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
  
    promotionCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(card);
        
        const button = card.querySelector('.promotion-btn');
        if (button) {
            button.addEventListener('click', function() {
        
                alert('No more details.');
            });
        }
    });
}

/**
 * Upcoming Offers Slider Functionality
 */
function initOffersSlider() {
    const slider = document.querySelector('.offers-slider');
    const slides = document.querySelectorAll('.offers-slide');
    const prevBtn = document.querySelector('.offers-prev');
    const nextBtn = document.querySelector('.offers-next');
    
    if (!slider || slides.length === 0) return;
    
    let currentIndex = 0;
    let startX, moveX;
    let isAnimating = false;
    
    // Totally eliminate gaps by setting exact dimensions and positioning
    slides.forEach((slide) => {
        slide.style.position = 'absolute';
        slide.style.width = '100%';
        slide.style.left = '0';
        slide.style.right = '0';
        slide.style.opacity = '0';
        slide.style.visibility = 'hidden';
        slide.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
    });
    
    // Set initial slide to visible
    if (slides[0]) {
        slides[0].style.opacity = '1';
        slides[0].style.visibility = 'visible';
    }
    
    function goToSlide(index) {
        if (isAnimating) return;
        isAnimating = true;
        
        // Hide current slide
        if (slides[currentIndex]) {
            slides[currentIndex].style.opacity = '0';
            slides[currentIndex].style.visibility = 'hidden';
        }
        
        // Update index
        currentIndex = index;
        
        if (currentIndex < 0) {
            currentIndex = slides.length - 1;
        } else if (currentIndex >= slides.length) {
            currentIndex = 0;
        }
        
        // Show new slide
        if (slides[currentIndex]) {
            slides[currentIndex].style.opacity = '1';
            slides[currentIndex].style.visibility = 'visible';
        }
        
        // Reset animation flag after transition
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }
    
    // Next and previous controls
    function goToNext() {
        goToSlide(currentIndex + 1);
    }
    
    function goToPrev() {
        goToSlide(currentIndex - 1);
    }
    
    // Event listeners for buttons
    if (prevBtn) prevBtn.addEventListener('click', goToPrev);
    if (nextBtn) nextBtn.addEventListener('click', goToNext);
    
    // Touch events for swiping
    slider.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    }, { passive: true });
    
    slider.addEventListener('touchmove', function(e) {
        if (!startX) return;
        moveX = e.touches[0].clientX;
    }, { passive: true });
    
    slider.addEventListener('touchend', function() {
        if (!startX || !moveX) return;
        const diff = moveX - startX;
        
        if (diff > 50) {
            goToPrev();
        } else if (diff < -50) {
            goToNext();
        }
        
        startX = null;
        moveX = null;
    });
    
    // Hover pause functionality
    let interval = setInterval(goToNext, 5000);
    
    slider.addEventListener('mouseenter', () => {
        clearInterval(interval);
    });
    
    slider.addEventListener('mouseleave', () => {
        interval = setInterval(goToNext, 5000);
    });
    
    // Observe slider entering viewport
    const sliderObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            interval = setInterval(goToNext, 5000);
        } else {
            clearInterval(interval);
        }
    }, { threshold: 0.5 });
    
    sliderObserver.observe(slider);
    
    // Functionality for offer buttons to prefill the flight search form
    setupOfferButtons();
}

/**
 * Functionality for offer buttons to prefill the flight search form
 */
function setupOfferButtons() {
    const offerButtons = document.querySelectorAll('.offer-btn');
    
    offerButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          
            const departure = this.getAttribute('data-departure');
            const destination = this.getAttribute('data-destination');
            const date = this.getAttribute('data-date');
            
            setTimeout(() => {
                const departureSelect = document.getElementById('departure');
                const destinationSelect = document.getElementById('destination');
                const departureDateInput = document.getElementById('departure-date');
                const roundTripRadio = document.getElementById('round-trip');
                
                // Set the departure and destination selects
                if (departureSelect && departure) {
                    departureSelect.value = departure;
                }
                
                if (destinationSelect && destination) {
                    destinationSelect.value = destination;
                }
                
                // Set the departure date
                if (departureDateInput && date) {
                    departureDateInput.value = date;
                }
                
                // Ensure round-trip is selected
                if (roundTripRadio) {
                    roundTripRadio.checked = true;
                    
                    // Show return date field
                    const returnDateField = document.querySelector('.return-date');
                    if (returnDateField) {
                        returnDateField.style.display = 'block';
                    }
                }
                
                // Scroll to the flight selection section
                document.getElementById('flight-selection').scrollIntoView({ behavior: 'smooth' });
                
                // Highlight the search container 
                const searchContainer = document.querySelector('.search-container');
                if (searchContainer) {
                    searchContainer.classList.add('highlight-container');
                    setTimeout(() => {
                        searchContainer.classList.remove('highlight-container');
                    }, 2000);
                }
            }, 100);
        });
    });
}

/**
 * Travel Tips Expandable Content
 */
function initTravelTips() {
    const tipCards = document.querySelectorAll('.tip-card');
    
    tipCards.forEach(card => {
        const expandBtn = card.querySelector('.tip-expand');
        
        if (expandBtn) {
            expandBtn.addEventListener('click', function() {
                // Toggle active class
                card.classList.toggle('active');
                
                // Update button text
                if (card.classList.contains('active')) {
                    this.textContent = 'Read Less';
                } else {
                    this.textContent = 'Read More';
                }
                
                // Arrow back after text change
                this.style.display = 'flex';
                
                // Animate other cards
                tipCards.forEach(otherCard => {
                    if (otherCard !== card && otherCard.classList.contains('active')) {
                        otherCard.classList.remove('active');
                        const otherBtn = otherCard.querySelector('.tip-expand');
                        if (otherBtn) otherBtn.textContent = 'Read More';
                    }
                });
            });
        }
    });
    
    // Intersection observer for tip cards
    const tipObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                tipObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Set initial styles and observe each card
    tipCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.5s ease ${index * 0.15}s`;
        tipObserver.observe(card);
    });
}