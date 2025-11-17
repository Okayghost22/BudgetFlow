import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { saveBudgets } from '../api/user';

const BUDGET_CATEGORIES = [
  { category: 'Food', icon: '🍔' },
  { category: 'Transport', icon: '🚗' },
  { category: 'Shopping', icon: '🛍️' },
  { category: 'Bills', icon: '💡' },
  { category: 'Entertainment', icon: '🎬' },
  { category: 'Booze', icon: '🍺' },
  { category: 'Health', icon: '🏥' },
  { category: 'Education', icon: '📚' },
  { category: 'Other', icon: '📦' }
];

const categoryColors = {
  Food: '#f97316',
  Transport: '#60a5fa',
  Shopping: '#a855f7',
  Bills: '#0ea5e9',
  Entertainment: '#f43f5e',
  Booze: '#ffb300',
  Health: '#10b981',
  Education: '#06b6d4',
  Other: '#6b7280'
};

export default function CreateBudgetModal({ onClose, onSuccess }) {
  const [budgets, setBudgets] = useState(
    BUDGET_CATEGORIES.map(cat => ({ category: cat.category, amount: 0 }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAmountChange = (index, value) => {
    const newBudgets = [...budgets];
    newBudgets[index].amount = Number(value) || 0;
    setBudgets(newBudgets);
  };

  const totalAmount = budgets.reduce((sum, cur) => sum + cur.amount, 0);

  const handleSubmit = async () => {
    if (totalAmount === 0) {
      setError('Please add at least one budget category');
      return;
    }

    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      await saveBudgets(token, budgets);
      onSuccess();
    } catch (err) {
      setError('Failed to save budgets: ' + (err.message || 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 flex justify-between items-center sticky top-0">
          <div>
            <h2 className="text-2xl font-bold">Create Your Own Budget</h2>
            <p className="text-primary-100 text-sm mt-1">Set custom limits for each category</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:scale-110 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {budgets.map((budget, index) => {
              const categoryData = BUDGET_CATEGORIES.find(c => c.category === budget.category);
              return (
                <motion.div
                  key={budget.category}
                  className="p-4 border rounded-lg hover:shadow-md transition"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <label className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{categoryData?.icon}</span>
                    <span className="font-semibold text-gray-700">{budget.category}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">₹</span>
                    <input
                      type="number"
                      value={budget.amount || ''}
                      onChange={(e) => handleAmountChange(index, e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="0"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg mb-6 border border-primary-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total Monthly Budget:</span>
              <span className="text-2xl font-bold text-primary-600">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || totalAmount === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Create & Save Budget'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
