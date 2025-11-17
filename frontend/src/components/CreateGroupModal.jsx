// src/components/CreateGroupModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function CreateGroupModal({ isOpen, onClose, onCreateGroup, token }) {
  const [groupName, setGroupName] = useState('');
  const [memberEmails, setMemberEmails] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleAddEmailField = () => {
    setMemberEmails([...memberEmails, '']);
  };

  const handleEmailChange = (index, value) => {
    const updated = [...memberEmails];
    updated[index] = value;
    setMemberEmails(updated);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const validEmails = memberEmails.filter(e => e.trim());
      
      const result = await onCreateGroup({
        name: groupName,
        members: validEmails
      });

      setSuccess(result.message || 'Group created successfully! Invites sent.');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setGroupName('');
        setMemberEmails(['']);
        setSuccess(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Group</h2>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-3 flex gap-2"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 flex gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </motion.div>
              )}

              {/* Group Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Name
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Family Budget, Team Expenses"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 dark:focus:border-teal-400 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Email Invites */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invite Members (Optional)
                </label>
                <div className="space-y-2">
                  {memberEmails.map((email, index) => (
                    <motion.input
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="member@example.com"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 dark:focus:border-teal-400 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                      disabled={loading}
                    />
                  ))}
                </div>
                <motion.button
                  onClick={handleAddEmailField}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-2 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  + Add another member
                </motion.button>
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  📧 Invites will be sent to members at <strong>sj5873@srmist.edu.in</strong>.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex gap-3 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium transition-all disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleCreate}
                disabled={loading || !groupName.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? 'Creating...' : 'Create'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
