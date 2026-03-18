const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
};

// Middleware to check if user is authenticated
const authorizeUser = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(403).json({ error: 'User access required' });
  }
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeUser
};
