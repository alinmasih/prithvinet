const db = require('../config/localDb');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, region, officeId } = req.body;

  try {
    const userExists = db.prepare('SELECT email FROM users WHERE email = ?').get(email);

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, assigned_region, industry_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name, email, hashedPassword, role || 'Industry User', region, officeId);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user)
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      if (role && user.role !== role) {
        return res.status(401).json({ message: `Access denied. Authorized role: ${user.role}` });
      }

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Refresh access token
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId || decoded.id);
    
    if (!user) return res.status(401).json({ message: 'User not found' });

    res.json({ accessToken: generateAccessToken(user) });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

module.exports = { registerUser, loginUser, refreshAccessToken };
