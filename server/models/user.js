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
    // We'll add location and other fields later
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create and export the User model from the schema
module.exports = mongoose.model('User', UserSchema);
