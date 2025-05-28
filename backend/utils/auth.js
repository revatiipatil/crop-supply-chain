import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Protect routes - Authentication middleware
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ error: "Not authorized to access this route" });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({ error: "Not authorized to access this route" });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: "Server error" });
    }
};

// Grant access to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
}; 