// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const router = express.Router();

// ✅ Validation schema for registration
const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// ✅ Validation schema for login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// ✅ POST - Register new user
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body.email);

    // Validate input
    const { error } = registerSchema.validate(req.body);
    if (error) {
      console.error('❌ Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.error('❌ Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashed,
      profileComplete: false
    });

    await user.save();
    console.log('✅ User registered successfully:', email);

    res.status(201).json({
      message: 'User registered successfully. Please login.'
    });
  } catch (err) {
    console.error('❌ Server error during registration:', err.message);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ✅ POST - Login user
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);

    // Validate input
    const { error } = loginSchema.validate(req.body);
    if (error) {
      console.error('❌ Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Password incorrect for:', email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'some-default-secret';
    const token = jwt.sign(
      { id: user._id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email);

    // ✅ CRITICAL: Return complete user data
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age || null,
        sex: user.sex || null,
        salary: user.salary || 0,
        businessIncome: user.businessIncome || 0,
        totalIncome: user.totalIncome || 0,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=14b8a6&color=fff`,
        profileComplete: user.profileComplete || false
      }
    });
  } catch (err) {
    console.error('❌ Server error during login:', err.message);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;
