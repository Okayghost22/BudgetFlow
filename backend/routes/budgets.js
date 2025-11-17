const express = require('express');
const Joi = require('joi');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction'); // <-- import Transaction!
const auth = require('../middleware/auth');
const router = express.Router();

const budgetSchema = Joi.object({
  category: Joi.string().required(),
  limit: Joi.number().required()
});

// Get all budgets for user, with 'used' amount for each
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;
  // Get user's budgets
  const budgets = await Budget.find({ user: userId });

  // Get expenses, grouped by category
  const txs = await Transaction.aggregate([
    { $match: { user: userId, type: 'expense' } },
    { $group: { _id: '$category', used: { $sum: '$amount' } } }
  ]);
  // Build lookup for fast access
  const usedLookup = Object.fromEntries(txs.map(t => [t._id, t.used]));

  // Attach usage info to budgets
  const result = budgets.map(budget => ({
    _id: budget._id,
    category: budget.category,
    limit: budget.limit,
    used: usedLookup[budget.category] || 0
  }));
  res.json(result);
});

// Add budget
router.post('/', auth, async (req, res) => {
  const { error } = budgetSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const budget = new Budget({ ...req.body, user: req.user.id });
  await budget.save();
  res.status(201).json(budget);
});

// Update budget
router.put('/:id', auth, async (req, res) => {
  const { error } = budgetSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: req.body },
    { new: true }
  );
  if (!budget) return res.status(404).json({ error: 'Budget not found.' });
  res.json(budget);
});

// Delete budget
router.delete('/:id', auth, async (req, res) => {
  await Budget.deleteOne({ _id: req.params.id, user: req.user.id });
  res.json({ message: 'Budget deleted.' });
});

module.exports = router;
