// backend/routes/user.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Joi = require('joi');
const User = require('../models/User');

// ✅ Validation schema for profile
const profileSchema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().min(12).max(120).required(),
  sex: Joi.string().valid('M', 'F', 'O').required(),
  salary: Joi.number().min(0).default(0),
  businessIncome: Joi.number().min(0).default(0),
  totalIncome: Joi.number().min(0).required(),
  email: Joi.string().email().optional(),
  avatar: Joi.string().optional()
});

// ✅ Validation schema for budgets - FIXED: allows percent field
const budgetsSchema = Joi.object({
  budgets: Joi.array().items(
    Joi.object({
      category: Joi.string().required(),
      amount: Joi.number().min(0).required(),
      percent: Joi.number().min(0).max(100).optional()  // ✅ NOW ALLOWED
    })
  ).required()
});

// ✅ POST - Save/Update user profile
router.post('/profile', auth, async (req, res) => {
  try {
    console.log('📝 Updating profile for user:', req.user.id);
    console.log('📝 Profile data received:', req.body);

    const { error, value } = profileSchema.validate(req.body);
    if (error) {
      console.error('❌ Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, age, sex, salary, businessIncome, totalIncome, email, avatar } = value;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        age,
        sex,
        salary,
        businessIncome,
        totalIncome,
        email: email || req.user.email,
        avatar: avatar || `https://ui-avatars.com/api/?name=${name}&background=14b8a6&color=fff`,
        profileComplete: true
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      console.error('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Profile updated successfully:', updatedUser);
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        age: updatedUser.age,
        sex: updatedUser.sex,
        salary: updatedUser.salary,
        businessIncome: updatedUser.businessIncome,
        totalIncome: updatedUser.totalIncome,
        email: updatedUser.email,
        avatar: updatedUser.avatar
      }
    });
  } catch (err) {
    console.error('❌ Error updating profile:', err.message);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// ✅ GET - Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('👤 Fetching profile for user:', req.user.id);

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      console.error('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Profile fetched successfully:', user);

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      sex: user.sex,
      salary: user.salary || 0,
      businessIncome: user.businessIncome || 0,
      totalIncome: user.totalIncome || 0,
      avatar: user.avatar,
      profileComplete: user.profileComplete || false
    });
  } catch (err) {
    console.error('❌ Error fetching profile:', err.message);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// ✅ POST - Save budgets for user - FIXED: accepts percent field
router.post('/budgets', auth, async (req, res) => {
  try {
    console.log('💾 Saving budgets for user:', req.user.id);
    console.log('💾 Budgets received:', req.body);

    const { error, value } = budgetsSchema.validate(req.body);
    if (error) {
      console.error('❌ Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { budgets } = value;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { budgets },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      console.error('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Budgets saved successfully:', updatedUser.budgets);

    res.json({
      message: 'Budgets saved successfully',
      budgets: updatedUser.budgets || []
    });
  } catch (err) {
    console.error('❌ Error saving budgets:', err.message);
    res.status(500).json({ error: 'Error saving budgets' });
  }
});

// ✅ GET - Get budgets for user
router.get('/budgets', auth, async (req, res) => {
  try {
    console.log('📊 Fetching budgets for user:', req.user.id);

    const user = await User.findById(req.user.id);

    if (!user) {
      console.error('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    const budgets = user.budgets || [];
    console.log('✅ Budgets fetched successfully:', budgets);

    res.json(budgets);
  } catch (err) {
    console.error('❌ Error fetching budgets:', err.message);
    res.status(500).json({ error: 'Error fetching budgets' });
  }
});

// ✅ PUT - Update user income
router.put('/income', auth, async (req, res) => {
  try {
    console.log('💰 Updating income for user:', req.user.id);
    console.log('💰 Income received:', req.body.income);

    const { income } = req.body;

    if (typeof income !== 'number' || income < 0) {
      console.error('❌ Invalid income:', income);
      return res.status(400).json({ error: 'Invalid income amount' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { totalIncome: income },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      console.error('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Income updated successfully:', updatedUser.totalIncome);

    res.json({
      message: 'Income updated successfully',
      income: updatedUser.totalIncome
    });
  } catch (err) {
    console.error('❌ Error updating income:', err.message);
    res.status(500).json({ error: 'Error updating income' });
  }
});

// ✅ GET - Get user income
router.get('/income', auth, async (req, res) => {
  try {
    console.log('💰 Fetching income for user:', req.user.id);

    const user = await User.findById(req.user.id);

    if (!user) {
      console.error('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Income fetched successfully:', user.totalIncome);

    res.json({
      income: user.totalIncome || 0
    });
  } catch (err) {
    console.error('❌ Error fetching income:', err.message);
    res.status(500).json({ error: 'Error fetching income' });
  }
});

// ✅ GET - Check if profile is complete
router.get('/profile-complete', auth, async (req, res) => {
  try {
    console.log('🔍 Checking profile completion for user:', req.user.id);

    const user = await User.findById(req.user.id);

    if (!user) {
      console.error('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    const profileComplete = !!(
      user.name &&
      user.age &&
      user.sex &&
      (user.salary !== undefined || user.salary !== null) &&
      (user.businessIncome !== undefined || user.businessIncome !== null) &&
      user.totalIncome !== undefined
    );

    console.log('✅ Profile completion status:', profileComplete);

    res.json({
      profileComplete,
      profile: {
        name: user.name || null,
        age: user.age || null,
        sex: user.sex || null,
        salary: user.salary || 0,
        businessIncome: user.businessIncome || 0,
        totalIncome: user.totalIncome || 0
      }
    });
  } catch (err) {
    console.error('❌ Error checking profile completion:', err.message);
    res.status(500).json({ error: 'Error checking profile completion' });
  }
});

// ✅ DELETE - Delete user profile
router.delete('/profile', auth, async (req, res) => {
  try {
    console.log('🗑️ Deleting user profile:', req.user.id);

    const deletedUser = await User.findByIdAndDelete(req.user.id);

    if (!deletedUser) {
      console.error('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User profile deleted successfully');

    res.json({
      message: 'User profile deleted successfully'
    });
  } catch (err) {
    console.error('❌ Error deleting profile:', err.message);
    res.status(500).json({ error: 'Error deleting profile' });
  }
});

module.exports = router;
