// server/app.js

const express = require('express'); // Import the express library
// --- NEW: Require the 'path' module to handle file paths ---
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose'); // NEW: Import mongoose
require('dotenv').config(); // NEW: Load environment variables from .env file

const bcrypt = require('bcryptjs'); // NEW: Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // NEW: Import jsonwebtoken
const User = require('./models/user'); // NEW: Import the user model
const auth = require('./middleware/auth'); // NEW: Import your auth middleware


const app = express();              // Create an instance of the express application
const port = 3000;                  // Define the port your server will listen on

// Middleware to parse JSON bodies (for when frontend sends JSON data)
app.use(express.json());
app.use(cors());
// --- NEW: Serve static files from the 'client' folder ---
// This tells Express to look for files like index.html, style.css, script.js
// inside the 'client' folder when a request comes in.
app.use(express.static(path.join(__dirname, '../client')));

// NEW: Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error('MongoDB connection error:', err));


// Define a route for the root URL ("/")
app.get('/api/hello', (req, res) => {
    res.send('Hello from the backend server!'); // Send the simple text response here
});

// User Registration Route
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Check if user already exists (DO NOT use 'const User' here)
        let user = await User.findOne({ email }); // CHANGED: Removed 'const' before User. Using 'let user'
        if (user) {
            return res.status(400).json({ message: 'User with that email already exists.' });
        }

        user = await User.findOne({ username }); // CHANGED: Removed 'const' before User. Using 'user ='
        if (user) {
            return res.status(400).json({ message: 'Username already taken.' }); // FIXED: messege -> message
        }

        // 2. Create new user instance
        user = new User({ // CHANGED: Removed 'const' before User. Using 'user = new User(...)'
            username,
            email,
            password
        });

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt); // CHANGED: Used 'user.password' not 'User.password'

        // 4. Save the user to the database
        await user.save(); // CHANGED: Used 'user.save()' not 'User.save()'

        // 5. Send a success response
        res.status(201).json({ message: 'User registered successfully!' });

    } catch (err) { // CHANGED: Used 'err' for consistency, but 'error' is also fine
        console.error(err.message);
        res.status(500).send('Server error during registration');
    }
});

// --- NEW: User Login Route ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Create a JSON Web Token (JWT)
        // The payload usually contains non-sensitive user info (like user ID)
        const payload = {
            user: {
                id: user.id // MongoDB's _id is exposed as 'id' by Mongoose
            }
        };

        // Sign the token with your secret key from .env
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.json({ token, message: 'Logged in successfully!' }); // Send the token back to the frontend
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during login');
    }
});

// --- NEW: Protected Route Example ---
app.get('/api/protected', auth, (req, res) => {
    // This route will only be reached if the JWT is valid
    console.log('Access granted to protected route for user ID:', req.user.id);
    res.json({ message: `Welcome, authenticated user with ID: ${req.user.id}! This is protected data.` });
});

// --- NEW: User Profile Routes ---

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private (requires authentication)
app.get('/api/profile/me', auth, async (req, res) => {
    try {
        // req.user.id comes from the auth middleware after token verification
        const user = await User.findById(req.user.id).select('-password'); // Exclude password field
        if (!user) {
            return res.status(404).json({ message: 'User profile not found' });
        }
        res.json(user); // Send the user's profile data
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/profile/me
// @desc    Update current user's profile
// @access  Private (requires authentication)
app.put('/api/profile/me', auth, async (req, res) => {
    // Extract fields from request body. Use destructuring for clarity.
    const { bio, location, gender, age, interests } = req.body;

    // Build a profileFields object based on what's provided in the request
    const profileFields = {};
    if (bio) profileFields.bio = bio;
    if (location) profileFields.location = location;
    if (gender) profileFields.gender = gender;
    if (age) profileFields.age = age;
    if (interests) {
        // Interests could be a comma-separated string from frontend; convert to array
        profileFields.interests = interests.split(',').map(interest => interest.trim());
    }

    try {
        // Find the user by ID and update their profile
        // { new: true } returns the updated document
        // { runValidators: true } ensures Mongoose schema validators run on update
        let user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields }, // $set operator updates specific fields
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password from the response

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully!', user });

    } catch (err) {
        console.error(err.message);
        // Handle specific validation errors from Mongoose
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).send('Server Error');
    }
});
// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Press Ctrl+C to stop the server');
});
