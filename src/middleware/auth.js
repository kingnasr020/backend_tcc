const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'scribble_secret_key_2026';

const authenticate = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ success: false, message: "Akses ditolak. Token tidak ada!" });
    
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: "Token tidak valid!" });
    }
};

module.exports = { authenticate };