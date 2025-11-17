// src/pages/PersonalDashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Wallet, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import AddTransaction from './Addtransaction';

export default function PersonalDashboard({ 
  userProfile, 
  budgets, 
  transactions, 
  pieChartData, 
  monthlyTrendData,
  categoryColors,
  onTransactionAdded 
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Calculate total stats
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Card */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-semibold mb-1">💰 YOUR BALANCE</p>
            <h2 className="text-4xl font-bold mb-2">₹{balance.toFixed(2)}</h2>
            <p className="text-blue-100">Personal Finance Tracker</p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center"
          >
            <Wallet className="w-12 h-12" />
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-600 dark:text-green-400 font-semibold">INCOME</p>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{totalIncome.toFixed(0)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-4 border border-red-200 dark:border-red-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold">EXPENSE</p>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">₹{totalExpense.toFixed(0)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">BUDGETS</p>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{budgets.length}</p>
        </div>
      </motion.div>

      {/* Add Transaction */}
      <motion.div variants={itemVariants}>
        <AddTransaction onTransactionAdded={onTransactionAdded} />
      </motion.div>

      {/* Budget Cards */}
      {budgets && budgets.length > 0 && (
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📊 Budget Overview</h3>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {budgets.map((budget, idx) => {
              const spent = transactions
                .filter(tx => tx.category.toLowerCase() === budget.category.toLowerCase() && tx.type === 'expense')
                .reduce((sum, tx) => sum + tx.amount, 0);
              
              const percentage = (spent / budget.amount) * 100;
              const isOver = spent > budget.amount;

              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`rounded-xl p-4 border-2 ${
                    isOver
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-700'
                      : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700'
                  }`}
                >
                  <p className="font-semibold text-gray-800 dark:text-white mb-2">{budget.category}</p>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={isOver ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}>
                      ₹{spent.toFixed(0)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">₹{budget.amount}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <motion.div
                      className={isOver ? 'bg-red-500' : 'bg-blue-500'}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.8 }}
                      style={{ height: '100%', borderRadius: '9999px' }}
                    />
                  </div>
                  <p className={`text-xs font-semibold ${isOver ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {percentage.toFixed(0)}% used
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-blue-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">💸 Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[index % 9]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(0)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-cyan-100 dark:border-cyan-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📈 Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyTrendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toFixed(0)}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">💳 Recent Transactions</h3>
        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.slice(0, 8).map((tx, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{tx.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx.category} • {new Date(tx.date).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`font-bold text-lg ${tx.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                  {tx.type === 'expense' ? '-' : '+'}₹{tx.amount}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No transactions yet</p>
        )}
      </motion.div>
    </motion.div>
  );
}
