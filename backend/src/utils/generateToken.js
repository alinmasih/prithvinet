const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id || user._id, 
      role: user.role, 
      assigned_region: user.assigned_region,
      industry_id: user.industry_id,
      approved_status: user.approved_status,
      region: user.region || user.assigned_region, 
      officeId: user.officeId 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id || user._id }, 
    process.env.REFRESH_TOKEN_SECRET, 
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
