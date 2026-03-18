const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRE = '7d';

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const connection = await pool.getConnection();

    // Check if user already exists
    const [existingUser] = await connection.query(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'user', phone || null]
    );

    connection.release();

    const newUser = {
      id: result.insertId,
      name,
      email,
      role: 'user'
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const connection = await pool.getConnection();

    // Find user by email
    const [users] = await connection.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    connection.release();

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', async (req, res) => {
  try {
    // Token is verified in middleware
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT id, name, email, role, phone, street, city, state, zip_code, country, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      user: users[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { name, phone, street, city, state, zip_code, country } = req.body;

    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE users SET name = ?, phone = ?, street = ?, city = ?, state = ?, zip_code = ?, country = ? WHERE id = ?',
      [name, phone, street, city, state, zip_code, country, decoded.id]
    );

    const [users] = await connection.query(
      'SELECT id, name, email, role, phone, street, city, state, zip_code, country FROM users WHERE id = ?',
      [decoded.id]
    );

    connection.release();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: users[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
