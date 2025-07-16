// server/middleware/auth.js

const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables here too for JWT_SECRET

module.exports = function (req, res, next) {
    // Get token from header
    // The token is usually sent in the 'x-auth-token' header or 'Authorization: Bearer <token>'
    const token = req.header('x-auth-token'); // Or req.header('Authorization')?.replace('Bearer ', ''); if using Bearer scheme

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        // jwt.verify takes the token and the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user from payload to the request object
        // This makes the user's ID available in your route handlers (e.g., req.user.id)
        req.user = decoded.user;
        next(); // Move to the next middleware/route handler
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
