const jwt = require('jsonwebtoken');
const db = require('../config/localDb');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const userId = decoded.userId || decoded.id;
      console.log('DEBUG: Auth Middleware - userId from token:', userId);

      // 1. Development/System Bypass
      if (userId === '00000000-0000-0000-0000-000000000000') {
        const admin = db.prepare("SELECT * FROM users WHERE role = 'Admin' LIMIT 1").get();
        if (admin) {
           console.log('DEBUG: Dev bypass active for admin:', admin.id);
           req.user = { ...admin, _id: admin.id };
           return next();
        }
      }

      // 2. Local DB Lookup
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      console.log('DEBUG: User found in DB:', user ? user.id : 'null');
      
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = {
        ...user,
        _id: user.id // Bridge for legacy frontend components
      };
      
      return next();

    } catch (error) {
      console.error('Auth Middleware Token Failure:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role ${req.user ? req.user.role : 'Guest'} is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
