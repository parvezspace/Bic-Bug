// server/app.js

const express = require('express'); // Import the express library
const app = express();              // Create an instance of the express application
const port = 3000;                  // Define the port your server will listen on

// --- NEW: Require the 'path' module to handle file paths ---
const path = require('path');

// Middleware to parse JSON bodies (for when frontend sends JSON data)
app.use(express.json());

// --- NEW: Serve static files from the 'client' folder ---
// This tells Express to look for files like index.html, style.css, script.js
// inside the 'client' folder when a request comes in.
app.use(express.static(path.join(__dirname, '../client')));

// Define a route for the root URL ("/")
app.get('/api/hello', (req, res) => {
    res.send('Hello from the backend server!'); // Send the simple text response here
});

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Press Ctrl+C to stop the server');
});
