// src/pages/GroupDashboard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, MessageSquare, Activity, Trash2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';
import AddTransaction from './Addtransaction';
import MemberManagement from '../components/MemberManagement';
import { deleteGroup } from '../api/groups';

export default function GroupDashboard({ 
  currentGroup,
  budgets, 
  transactions, 
  monthlyTrendData,
  onTransactionAdded,
  token,
  userProfile
}) {
  const navigate = useNavigate();
  const [refreshMembers, setRefreshMembers] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const totalGroupExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalGroupIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // ✅ Handle delete group - ALWAYS allow for now (simplified)
  const handleDeleteGroup = async () => {
    try {
      setIsDeleting(true);
      console.log('🗑️ Deleting group:', currentGroup._id);
      
      await deleteGroup(token, currentGroup._id);
      
      console.log('✅ Group deleted successfully');
      alert('✅ Group deleted successfully!');
      
      // Redirect to dashboard
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      console.error('❌ Error deleting group:', err);
      alert('❌ Error: ' + err.message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ✅ SIMPLE DELETE BUTTON AT TOP */}
      <motion.div
        variants={itemVariants}
        className="flex justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <Trash2 className="w-5 h-5" />
          Delete This Group
        </motion.button>
      </motion.div>

      {/* ✅ DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Group?</h3>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete <span className="font-bold">"{currentGroup?.name}"</span>?
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 mb-4 rounded">
              <p className="text-sm text-red-700 dark:text-red-200">
                ⚠️ <strong>This will permanently delete:</strong>
              </p>
              <ul className="text-sm text-red-600 dark:text-red-300 mt-2 ml-4 space-y-1">
                <li>✗ All group data</li>
                <li>✗ All transactions</li>
                <li>✗ All budgets</li>
                <li>✗ Member list</li>
              </ul>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              ⚠️ This action CANNOT be undone!
            </p>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteGroup}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ⏳
                    </motion.span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Yes, Delete
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ✅ HERO CARD - No delete button here */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-pink-100 text-sm font-semibold mb-2 uppercase tracking-wide">👥 Team Finance</p>
            <h2 className="text-3xl font-bold mb-1">{currentGroup?.name}</h2>
            <p className="text-pink-100">{currentGroup?.members?.length || 0} members collaborating</p>
          </div>
          
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl"
          >
            👥
          </motion.div>
        </div>
      </motion.div>

      {/* Members Quick Preview */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Team Members Preview
        </h3>
        <div className="flex flex-wrap gap-3">
          {currentGroup?.members?.slice(0, 5).map((member, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg border-3 border-white dark:border-gray-800 shadow-lg ${
                member.role === 'admin' 
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-400' 
                  : 'bg-gradient-to-br from-purple-400 to-pink-400'
              }`}>
                {member.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2 text-center max-w-14 truncate">
                {member.user?.name?.split(' ')[0] || 'Member'}
              </p>
              {member.role === 'admin' && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-bold">👑</p>
              )}
            </motion.div>
          ))}
          {currentGroup?.members?.length > 5 && (
            <div className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold border-3 border-white dark:border-gray-800">
              +{currentGroup.members.length - 5}
            </div>
          )}
        </div>
      </motion.div>

      {/* Group Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-4 border-2 border-pink-200 dark:border-pink-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-pink-600" />
            <p className="text-xs text-pink-600 dark:text-pink-400 font-bold uppercase">Total Spent</p>
          </div>
          <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">₹{totalGroupExpense.toFixed(0)}</p>
          <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">Group total</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase">Per Member</p>
          </div>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            ₹{(totalGroupExpense / (currentGroup?.members?.length || 1)).toFixed(0)}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Average share</p>
        </div>
      </motion.div>

      {/* Add Transaction */}
      <motion.div variants={itemVariants}>
        <AddTransaction onTransactionAdded={onTransactionAdded} />
      </motion.div>

      {/* Group Budgets */}
      {budgets && budgets.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🎯 Shared Budgets</h3>
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {budgets.map((budget, idx) => {
              const spent = transactions
                .filter(tx => tx.category.toLowerCase() === budget.category.toLowerCase() && tx.type === 'expense')
                .reduce((sum, tx) => sum + tx.amount, 0);
              
              const percentage = (spent / budget.amount) * 100;

              return (
                <motion.div key={idx} variants={itemVariants} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-800 dark:text-white">{budget.category}</p>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 mb-2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-3"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>₹{spent.toFixed(0)} / ₹{budget.amount}</span>
                    <span>{budget.amount - spent > 0 ? '₹' + (budget.amount - spent).toFixed(0) + ' left' : 'Over!'}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-purple-100 dark:border-purple-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📊 Spending Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyTrendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toFixed(0)}`} />
              <Legend />
              <Line type="monotone" dataKey="expense" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="income" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-pink-100 dark:border-pink-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📈 Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyTrendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toFixed(0)}`} />
              <Legend />
              <Bar dataKey="income" fill="#a78bfa" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#f472b6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Group Activity */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-pink-600" />
          Group Activity
        </h3>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 6).map((tx, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                  💰
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-white">{tx.description}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{tx.category} • {new Date(tx.date).toLocaleDateString('en-IN')}</p>
                </div>
                <span className="font-bold text-lg text-pink-600 dark:text-pink-400">
                  {tx.type === 'expense' ? '-' : '+'}₹{tx.amount}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No activity yet</p>
        )}
      </motion.div>

      {/* ✅ MEMBER MANAGEMENT COMPONENT */}
      {token && userProfile && (
        <motion.div variants={itemVariants} key={refreshMembers}>
          <MemberManagement
            groupId={currentGroup._id}
            token={token}
            currentUserId={userProfile.id}
            onUpdate={() => setRefreshMembers(prev => prev + 1)}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
