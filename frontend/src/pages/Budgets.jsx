// src/pages/Budgets.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTransactions } from '../api/transactions';
import { getBudgets } from '../api/budgets';
import { useLocation } from 'react-router-dom';

const categoryIcons = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '💡',
  Entertainment: '🎬',
  Booze: '🍺',
  Health: '🏥',
  Education: '📚',
  Other: '📦',
};

const categoryColors = {
  Food: '#f97316',
  Transport: '#60a5fa',
  Shopping: '#a855f7',
  Bills: '#0ea5e9',
  Entertainment: '#f43f5e',
  Booze: '#ffb300',
  Health: '#10b981',
  Education: '#06b6d4',
  Other: '#6b7280',
};

export default function Budgets() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(0);
  const location = useLocation();

  // ✅ CHANGE 1: Listen for transactionUpdated event globally
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Budgets page: transactionUpdated event received!');
      setRefreshFlag(prev => prev + 1);
    };
    
    window.addEventListener('transactionUpdated', handleStorageChange);
    return () => window.removeEventListener('transactionUpdated', handleStorageChange);
  }, []);

  // ✅ CHANGE 2: Fetch data with refreshFlag in dependency array
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (location.pathname === '/budgets' && token) {
      setLoading(true);
      setError('');
      console.log('📋 Budgets page: Fetching with refreshFlag:', refreshFlag);
      
      Promise.all([
        getBudgets(token),
        getTransactions(token)
      ])
        .then(([budgets, txs]) => {
          console.log('✅ Budgets fetched:', budgets);
          console.log('✅ Transactions fetched:', txs);
          setBudgets(Array.isArray(budgets) ? budgets : budgets.budgets || []);
          setTransactions(Array.isArray(txs) ? txs : txs.transactions || []);
        })
        .catch((err) => {
          console.error('❌ Error fetching:', err);
          setError('Failed to load budgets or transactions');
        })
        .finally(() => setLoading(false));
    }
  }, [location, refreshFlag]); // ✅ Added refreshFlag to dependency array

  // ✅ CHANGE 3: Case-insensitive category matching
  const spentByCategory = budgets.reduce((acc, b) => {
    acc[b.category] = transactions
      .filter(tx => tx.category.toLowerCase() === b.category.toLowerCase() && tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto py-8 px-2">
      <h2 className="text-2xl font-bold mb-6 text-primary-600">Your Budgets</h2>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading budgets...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          key={`budgets-grid-${refreshFlag}`}
        >
          {budgets.map(budget => {
            const spent = spentByCategory[budget.category] || 0;
            const limit = budget.amount;
            const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const icon = categoryIcons[budget.category] || '💳';
            const color = categoryColors[budget.category] || '#888';
            
            console.log(`💰 ${budget.category}: spent=${spent}, limit=${limit}, percent=${percent.toFixed(0)}%`);

            return (
              <motion.div 
                key={`${budget.category}-${refreshFlag}`}
                className="card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl" style={{ color }}>{icon}</span>
                  <span className="font-semibold text-lg">{budget.category}</span>
                  <span className="font-medium">₹{spent.toFixed(2)} / ₹{limit}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: color }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5 }}
                    key={`progress-${spent}`}
                  />
                </div>
                <div className="text-xs mt-1 text-gray-400">{percent.toFixed(0)}% used</div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
