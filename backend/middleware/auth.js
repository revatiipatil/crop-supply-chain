import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: "Access token required" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user id to request
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}; 