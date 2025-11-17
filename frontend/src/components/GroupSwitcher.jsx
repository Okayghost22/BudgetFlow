// src/components/GroupSwitcher.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Users, Home, Trash2 } from 'lucide-react';
import { deleteGroup } from '../api/groups';

export default function GroupSwitcher({ currentGroup, groups, onGroupChange, onCreateClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ✅ Get user profile and token from localStorage
  useEffect(() => {
    const userDataFromStorage = localStorage.getItem('user');
    const tokenFromStorage = localStorage.getItem('token');
    
    if (userDataFromStorage) {
      try {
        setUserProfile(JSON.parse(userDataFromStorage));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    
    if (tokenFromStorage) {
      setToken(tokenFromStorage);
    }
  }, []);

  const handleGroupSelect = (groupId) => {
    onGroupChange(groupId);
    setIsOpen(false);
  };

  // ✅ Handle delete group from dropdown
  const handleDeleteGroupFromDropdown = async (e, group) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(
      `⚠️ Are you sure you want to DELETE "${group.name}"?\n\nThis will:\n✗ Delete all group data\n✗ Delete all transactions\n✗ Delete all budgets\n\nThis action CANNOT be undone!`
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(group._id);
      console.log('🗑️ Deleting group from dropdown:', group._id);
      
      await deleteGroup(token, group._id);
      
      console.log('✅ Group deleted successfully');
      alert('✅ Group deleted successfully!');

      // ✅ Emit event so Dashboard can refresh
      window.dispatchEvent(new Event('groupDeleted'));
      
      // Refresh page to update groups list
      window.location.reload();
    } catch (err) {
      console.error('❌ Error deleting group:', err);
      alert('❌ Error: ' + err.message);
      setDeletingId(null);
    }
  };

  return (
    <div className="relative">
      {/* Main Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 hover:border-teal-500/60 transition-all duration-300"
      >
        <motion.div
          className="flex items-center gap-2"
          animate={{ x: isOpen ? 5 : 0 }}
        >
          {currentGroup?.isPersonal ? (
            <>
              <Home className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-medium">My Finance</span>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-medium">{currentGroup?.name}</span>
            </>
          )}
        </motion.div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500/5 to-cyan-500/5 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                💰 Workspaces
              </p>
            </div>

            {/* Personal Dashboard */}
            <motion.button
              onClick={() => handleGroupSelect('personal')}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
                currentGroup?.isPersonal 
                  ? 'bg-teal-500/10 border-l-4 border-teal-500' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              whileHover={{ x: 4 }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white">
                🏠
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">My Finance</p>
                <p className="text-xs text-gray-500">Personal budget</p>
              </div>
              {currentGroup?.isPersonal && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto w-2 h-2 rounded-full bg-teal-500"
                />
              )}
            </motion.button>

            {/* Shared Groups */}
            {groups && groups.length > 0 && (
              <>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 px-2">
                    👥 Shared
                  </p>
                </div>

                {groups.map((group) => {
                  // ✅ Check if user is creator of this group
                  const isCreator = group.createdBy === userProfile?.id;

                  return (
                    <motion.div
                      key={group._id}
                      className={`group/item flex items-center transition-all duration-200 ${
                        currentGroup?._id === group._id
                          ? 'bg-teal-500/10 border-l-4 border-teal-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <button
                        onClick={() => handleGroupSelect(group._id)}
                        className="flex-1 px-4 py-3 text-left flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                          {group.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{group.name}</p>
                          <p className="text-xs text-gray-500">{group.members?.length || 1} members</p>
                        </div>
                        {currentGroup?._id === group._id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-teal-500"
                          />
                        )}
                      </button>

                      {/* ✅ DELETE BUTTON - Only show if user is creator */}
                      {isCreator && (
                        <motion.button
                          onClick={(e) => handleDeleteGroupFromDropdown(e, group)}
                          disabled={deletingId === group._id}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="pr-3 p-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 disabled:opacity-50"
                          title="Delete group"
                        >
                          {deletingId === group._id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="text-red-500"
                            >
                              ⏳
                            </motion.div>
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                          )}
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </>
            )}

            {/* Create New Group Button */}
            <motion.button
              onClick={() => {
                onCreateClick();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all duration-200"
              whileHover={{ x: 4 }}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Create Group</p>
                <p className="text-xs text-gray-500">Add family or team</p>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close on Outside Click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
