// server/models/User.js

const mongoose = require('mongoose');

// Define the schema for a User
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensure usernames are unique
        trim: true    // Remove leading/trailing whitespace
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true // Store emails in lowercase
    },
    password: {
        type: String,
        required: true
        // We will hash this before saving, so it won't be plain text
    },
    profilePicture: {
        type: String, // URL to the profile picture
        default: ''   // Default empty string if no picture uploaded
    },
    // --- NEW PROFILE FIELDS ---
    bio: {
        type: String,
        maxlength: 500, // Limit bio length
        default: ''
    },
    location: { // Storing as a simple string for now (e.g., "Mumbai, India")
        type: String,
        default: ''
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'], // Enforce specific values
        default: 'Prefer not to say'
    },
    age: {
        type: Number,
        min: 13, // Minimum age for app usage
        max: 120 // Realistic max age
    },
    interests: { // Array of strings for multiple interests
        type: [String],
        default: []
    },
    // We'll add location and other fields later
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create and export the User model from the schema
module.exports = mongoose.model('User', UserSchema);
