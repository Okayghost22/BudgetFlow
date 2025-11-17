// src/pages/Transactions.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTransactions, deleteTransaction } from '../api/transactions';
import { useLocation } from 'react-router-dom';

const categoryIcons = {
  Food: '🍔',
  Groceries: '🛒',
  Transport: '🚗',
  Salary: '💵',
  Shopping: '🛍️',
  Bills: '💡',
  Entertainment: '🎬',
  Freelance: '💻',
  Utilities: '⚡',
  Rent: '🏠',
  Booze: '🍷',
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const [deleting, setDeleting] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not logged in');
      const result = await getTransactions(token);
      setTransactions(Array.isArray(result) ? result : (result.transactions || []));
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
      setTransactions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (location.pathname === '/transactions') {
      fetchTransactions();
    }
  }, [location]);

  // Delete transaction handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    const token = localStorage.getItem('token');
    setDeleting(id);
    try {
      await deleteTransaction(token, id);
      setTransactions((prev) => prev.filter((tx) => (tx._id || tx.id) !== id));
      console.log('Transaction deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete transaction');
    }
    setDeleting(null);
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto py-8 px-4"
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -35 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-600">All Transactions</h2>
        <span className="text-sm text-gray-500">
          Total: {transactions.length} transactions
        </span>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="inline-block animate-spin mr-2">⏳</div>
            Loading transactions...
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 dark:text-red-400 text-center py-8 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800"
          >
            ⚠️ {error}
          </motion.div>
        ) : transactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-400"
          >
            <div className="text-4xl mb-2">📭</div>
            <p>No transactions found. Start by adding your first transaction!</p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Icon</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {transactions.map((tx, index) => (
                    <motion.tr
                      key={tx._id || tx.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{
                        backgroundColor: tx.type === 'expense' ? 'rgba(254, 242, 242, 0.5)' : 'rgba(187, 247, 208, 0.5)',
                        transition: { duration: 0.15 }
                      }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow"
                    >
                      <td className="px-4 py-3 text-center text-2xl">
                        <motion.span
                          whileHover={{ rotate: 15, scale: 1.15 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {categoryIcons[tx.category] || '💳'}
                        </motion.span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {tx.date ? new Date(tx.date).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                        {tx.category || 'Uncategorized'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 italic">
                        {tx.description || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            tx.type === 'expense'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          }`}
                        >
                          {tx.type ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        <span className={tx.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                          {tx.type === 'expense' ? '−' : '+'}₹{Number(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleDelete(tx._id || tx.id)}
                          disabled={deleting === (tx._id || tx.id)}
                        >
                          {deleting === (tx._id || tx.id) ? (
                            <span className="flex items-center gap-1">
                              <span className="animate-spin">⌛</span>
                              Deleting...
                            </span>
                          ) : (
                            'Delete'
                          )}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          <div className="card p-4 text-center">
            <div className="text-gray-500 text-sm">Total Transactions</div>
            <div className="text-2xl font-bold text-primary-600">{transactions.length}</div>
          </div>

          <div className="card p-4 text-center">
            <div className="text-gray-500 text-sm">Total Expenses</div>
            <div className="text-2xl font-bold text-red-600">
              ₹{transactions
                .filter((tx) => tx.type === 'expense')
                .reduce((sum, tx) => sum + Number(tx.amount), 0)
                .toFixed(2)}
            </div>
          </div>

          <div className="card p-4 text-center">
            <div className="text-gray-500 text-sm">Total Income</div>
            <div className="text-2xl font-bold text-green-600">
              ₹{transactions
                .filter((tx) => tx.type === 'income')
                .reduce((sum, tx) => sum + Number(tx.amount), 0)
                .toFixed(2)}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
