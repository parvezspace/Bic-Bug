// client/script.js

document.addEventListener('DOMContentLoaded', () => {
    const backendMessageElement = document.getElementById('backend-message');
    const fetchButton = document.getElementById('fetchButton');

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

    // --- Initial Load ---
    fetchMessage(); // Fetch message when the page loads

    // --- Button Click ---
    fetchButton.addEventListener('click', fetchMessage); // Fetch message on button click
});
