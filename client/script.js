// client/script.js

document.addEventListener('DOMContentLoaded', () => {
    const backendMessageElement = document.getElementById('backend-message');
    const fetchButton = document.getElementById('fetchButton');
    const registerForm = document.getElementById('registerForm'); // NEW: Get the form
    const registrationStatusElement = document.getElementById('registration-status'); // NEW: Status element

    const loginForm = document.getElementById('loginForm'); // NEW: Get the login form
    const loginStatusElement = document.getElementById('login-status'); // NEW: Status element

    const fetchProtectedButton = document.getElementById('fetchProtectedButton'); // NEW: Get protected button
    const protectedStatusElement = document.getElementById('protected-status'); // NEW: Status element

// --- NEW: Profile Elements ---
    const profileForm = document.getElementById('profileForm');
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const profileBio = document.getElementById('profileBio');
    const profileLocation = document.getElementById('profileLocation');
    const profileGender = document.getElementById('profileGender');
    const profileAge = document.getElementById('profileAge');
    const profileInterests = document.getElementById('profileInterests');
    const fetchProfileButton = document.getElementById('fetchProfileButton'); // New button
    const profileStatusElement = document.getElementById('profile-status');

    // Function to fetch data from the backend
    async function fetchMessage() {
        try {
            // Make a GET request to your backend's root URL
            // Make a GET request to your new backend API endpoint
            const response = await fetch('http://localhost:3000/api/hello');
            if (!response.ok) { // Check if the response status is not 2xx
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const message = await response.text(); // Get the response as text
            backendMessageElement.textContent = `Message from Backend: ${message}`;
        } catch (error) {
            console.error('Error fetching message:', error);
            backendMessageElement.textContent = `Error: Could not connect to backend. Is the server running? (${error.message})`;
        }
    }
    // Handle Registration Form Submission
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission (page reload)

        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST', // Use POST method for registration
                headers: {
                    'Content-Type': 'application/json' // Tell the server we're sending JSON
                },
                body: JSON.stringify({ username, email, password }) // Send data as JSON string
            });

            const data = await response.json(); // Parse the JSON response from the backend

            if (response.ok) { // Check if status is 2xx
                registrationStatusElement.style.color = 'green';
                registrationStatusElement.textContent = data.message;
                registerForm.reset(); // Clear the form
            } else {
                registrationStatusElement.style.color = 'red';
                registrationStatusElement.textContent = data.message || 'Registration failed.';
            }
        } catch (error) {
            console.error('Registration error:', error);
            registrationStatusElement.style.color = 'red';
            registrationStatusElement.textContent = 'Network error during registration.';
        }
    });

// --- NEW: Handle Login Form Submission ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                loginStatusElement.style.color = 'green';
                loginStatusElement.textContent = data.message;
                loginForm.reset();

                // Store the JWT in localStorage
                localStorage.setItem('token', data.token);
                console.log('JWT stored:', data.token);

                // You might want to redirect the user or update UI here
                // For now, we'll just log it and show success message
            } else {
                loginStatusElement.style.color = 'red';
                loginStatusElement.textContent = data.message || 'Login failed.';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginStatusElement.style.color = 'red';
            loginStatusElement.textContent = 'Network error during login.';
        }
    });

    // --- NEW: Handle Fetch Protected Data Button Click ---
    fetchProtectedButton.addEventListener('click', async () => {
        const token = localStorage.getItem('token'); // Get the stored token

        if (!token) {
            protectedStatusElement.style.color = 'orange';
            protectedStatusElement.textContent = 'Please log in first to access protected content.';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/protected', {
                method: 'GET',
                headers: {
                    'x-auth-token': token // Send the token in the 'x-auth-token' header
                }
            });

            const data = await response.json(); // Protected route sends JSON

            if (response.ok) {
                protectedStatusElement.style.color = 'green';
                protectedStatusElement.textContent = `Protected data: ${data.message}`;
            } else {
                protectedStatusElement.style.color = 'red';
                protectedStatusElement.textContent = `Access denied: ${data.message || 'Authentication failed.'}`;
            }
        } catch (error) {
            console.error('Error fetching protected data:', error);
            protectedStatusElement.style.color = 'red';
            protectedStatusElement.textContent = 'Network error fetching protected data.';
        }
    });

     // --- NEW: Function to Fetch User Profile ---
    async function fetchUserProfile() {
        const token = localStorage.getItem('token');
        if (!token) {
            profileStatusElement.style.color = 'orange';
            profileStatusElement.textContent = 'Please log in to view/edit your profile.';
            // Clear profile fields if not logged in
            profileUsername.value = '';
            profileEmail.value = '';
            profileBio.value = '';
            profileLocation.value = '';
            profileGender.value = '';
            profileAge.value = '';
            profileInterests.value = '';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/profile/me', {
                method: 'GET',
                headers: {
                    'x-auth-token': token
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Populate the form fields with fetched data
                profileUsername.value = data.username || '';
                profileEmail.value = data.email || '';
                profileBio.value = data.bio || '';
                profileLocation.value = data.location || '';
                profileGender.value = data.gender || '';
                profileAge.value = data.age || '';
                profileInterests.value = data.interests ? data.interests.join(', ') : ''; // Convert array to comma-separated string

                profileStatusElement.style.color = 'green';
                profileStatusElement.textContent = 'Profile loaded successfully!';
            } else {
                profileStatusElement.style.color = 'red';
                profileStatusElement.textContent = `Error loading profile: ${data.message || 'Unknown error'}`;
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            profileStatusElement.style.color = 'red';
            profileStatusElement.textContent = 'Network error fetching profile.';
        }
    }

    // --- NEW: Handle Profile Form Submission (Update Profile) ---
    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            profileStatusElement.style.color = 'orange';
            profileStatusElement.textContent = 'Please log in to update your profile.';
            return;
        }

        // Collect data from the form
        const updatedProfile = {
            bio: profileBio.value,
            location: profileLocation.value,
            gender: profileGender.value,
            age: parseInt(profileAge.value, 10), // Convert age to number
            interests: profileInterests.value // Send as comma-separated string, backend will split
        };

        // Remove empty fields from the payload to avoid sending unnecessary updates
        Object.keys(updatedProfile).forEach(key => {
            if (updatedProfile[key] === '' || (Array.isArray(updatedProfile[key]) && updatedProfile[key].length === 0)) {
                delete updatedProfile[key];
            }
        });


        try {
            const response = await fetch('http://localhost:3000/api/profile/me', {
                method: 'PUT', // Use PUT method for updates
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(updatedProfile)
            });

            const data = await response.json();

            if (response.ok) {
                profileStatusElement.style.color = 'green';
                profileStatusElement.textContent = data.message;
                fetchUserProfile(); // Refresh profile data after update
            } else {
                profileStatusElement.style.color = 'red';
                profileStatusElement.textContent = data.message || 'Profile update failed.';
            }
        } catch (error) {
            console.error('Profile update error:', error);
            profileStatusElement.style.color = 'red';
            profileStatusElement.textContent = 'Network error during profile update.';
        }
    });

    // --- NEW: Handle Refresh Profile Button Click ---
    fetchProfileButton.addEventListener('click', fetchUserProfile);

    // --- Initial Load ---
    fetchMessage(); // Fetch message when the page loads

    // --- Button Click ---
    fetchButton.addEventListener('click', fetchMessage); // Fetch message on button click
});
