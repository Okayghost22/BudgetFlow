const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null }, // New field
  description: String,
  amount: Number,
  category: String,
  type: { type: String, enum: ['income', 'expense'], required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model('Transaction', transactionSchema);
