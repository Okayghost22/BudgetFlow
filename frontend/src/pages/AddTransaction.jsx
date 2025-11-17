// src/pages/Addtransaction.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { addTransaction } from '../api/transactions';
import { categories } from '../data/mockData';

export default function AddTransaction({ onTransactionAdded }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('NO TOKEN!');
      setError('Please login first.');
      return;
    }

    if (!description || !amount || !date || !category || !type) {
      console.log('MISSING FIELD!');
      setError('Please fill all fields');
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    console.log('FETCHING...');
    setLoading(true);

    try {
      const result = await addTransaction(token, {
        description,
        amount: parseFloat(amount),
        date,
        category,
        type
      });

      console.log('Transaction added:', result);

      // Clear form
      setDescription('');
      setAmount('');
      setDate('');
      setCategory('');
      setType('expense');

      setSuccess('Transaction added successfully! ✓');

      // NEW: Trigger budgets/dashboard refresh in parent
      if (typeof onTransactionAdded === 'function') {
        console.log('Calling onTransactionAdded callback...');
        onTransactionAdded();
      }

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error adding transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-primary-600">Add New Transaction</h2>

      <div className="card">
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300"
          >
            {success}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300"
          >
            {error}
          </motion.div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              className="form-control"
              type="text"
              placeholder="e.g., Grocery shopping"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (₹)
            </label>
            <input
              className="form-control"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              className="form-control"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Category</option>
              {categories && categories.map((c) => (
                <option key={c.value || c} value={c.value || c}>
                  {c.label || c}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              className="form-control"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          {/* Submit Button */}
          <motion.button
            className="btn-primary w-full"
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Adding...
              </span>
            ) : (
              'Add Transaction'
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
