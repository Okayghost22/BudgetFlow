// src/components/MemberManagement.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, UserMinus, Crown, User, LogOut, AlertCircle } from 'lucide-react';
import {
  getGroupMembers,
  getUserRoleInGroup,
  promoteToAdmin,
  demoteToMember,
  removeMember,
  leaveGroup
} from '../api/groups';

export default function MemberManagement({ groupId, token, currentUserId, onUpdate }) {
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ✅ Fetch members and user role on mount
  useEffect(() => {
    fetchMembersAndRole();
  }, [groupId, token]);

  const fetchMembersAndRole = async () => {
    try {
      setLoading(true);
      setError(null);

      const [membersData, roleData] = await Promise.all([
        getGroupMembers(token, groupId),
        getUserRoleInGroup(token, groupId)
      ]);

      setMembers(membersData.members || []);
      setUserRole(roleData);

      console.log('✅ Members and role loaded');
    } catch (err) {
      console.error('❌ Error fetching members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Promote member to admin
  const handlePromote = async (memberId) => {
    try {
      setActionLoading(memberId);
      await promoteToAdmin(token, groupId, memberId);
      setSuccessMessage('Member promoted to admin! 👑');
      await fetchMembersAndRole();
      setTimeout(() => setSuccessMessage(null), 3000);
      onUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Demote admin to member
  const handleDemote = async (memberId) => {
    try {
      setActionLoading(memberId);
      await demoteToMember(token, groupId, memberId);
      setSuccessMessage('Admin demoted to member');
      await fetchMembersAndRole();
      setTimeout(() => setSuccessMessage(null), 3000);
      onUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Remove member
  const handleRemove = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      setActionLoading(memberId);
      await removeMember(token, groupId, memberId);
      setSuccessMessage('Member removed from group');
      await fetchMembersAndRole();
      setTimeout(() => setSuccessMessage(null), 3000);
      onUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Leave group
  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group? You can request to rejoin later.')) return;

    try {
      setActionLoading('leave');
      await leaveGroup(token, groupId);
      setSuccessMessage('You left the group');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-600" />
          Team Members ({members.length})
        </h2>

        {userRole?.isMember && !userRole?.isCreator && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLeaveGroup}
            disabled={actionLoading === 'leave'}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            Leave Group
          </motion.button>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {members.map((member, idx) => {
          const isCurrentUser = member.user._id === currentUserId;
          const canManage = userRole?.isAdmin && !isCurrentUser;

          return (
            <motion.div
              key={member.user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-xl border-2 transition ${
                isCurrentUser
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                {/* Avatar & Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      {member.user.name}
                      {isCurrentUser && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {member.user.email}
                    </p>
                  </div>
                </div>

                {/* Role Badge */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    member.role === 'admin'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  {member.role === 'admin' ? (
                    <>
                      <Crown className="w-3 h-3" />
                      ADMIN
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" />
                      MEMBER
                    </>
                  )}
                </motion.div>
              </div>

              {/* Action Buttons - Only for admins managing other members */}
              {canManage && (
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                  {member.role === 'member' ? (
                    // Promote button
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePromote(member.user._id)}
                      disabled={actionLoading === member.user._id}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition disabled:opacity-50 text-sm font-semibold"
                    >
                      <Crown className="w-4 h-4" />
                      Promote
                    </motion.button>
                  ) : (
                    // Demote button
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDemote(member.user._id)}
                      disabled={actionLoading === member.user._id}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 text-sm font-semibold"
                    >
                      <User className="w-4 h-4" />
                      Demote
                    </motion.button>
                  )}

                  {/* Remove button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemove(member.user._id)}
                    disabled={actionLoading === member.user._id}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 text-sm font-semibold"
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove
                  </motion.button>
                </div>
              )}

              {/* Status */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  Status: <span className="font-semibold text-green-600 dark:text-green-400">{member.status}</span>
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {members.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No members yet</p>
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
      >
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <span className="font-semibold">Your Role:</span> {userRole?.role?.toUpperCase() || 'MEMBER'} {userRole?.isCreator && '(Creator)'}
        </p>
        {userRole?.isAdmin && (
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            ✅ You can manage members in this group
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
