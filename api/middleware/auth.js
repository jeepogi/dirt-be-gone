// api/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  
  if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

  try {
    // Removed the hardcoded fallback string
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { 
      id: payload.id, 
      role: payload.role 
    };
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) return res.status(403).json({ success: false, message: 'Forbidden' });
  next();
};

module.exports = { auth, requireRole };
