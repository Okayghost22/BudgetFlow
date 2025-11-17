import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTransactions } from '../api/transactions';
import { getBudgets } from '../api/budgets';
import FinanceAnimation from '../components/FinanceAnimation';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';
import GroupSwitcher from '../components/GroupSwitcher';
import CreateGroupModal from '../components/CreateGroupModal';
import CreateBudgetModal from '../components/CreateBudgetModal';
import { createGroup, getGroups } from '../api/groups';

// Import new dashboard components
import PersonalDashboard from './PersonalDashboard';
import GroupDashboard from './GroupDashboard';

// ✅ UPDATED: useBudgets now accepts currentGroup for group-aware fetching
function useBudgets(token, refreshFlag, currentGroup) {
  const [budgets, setBudgets] = useState([]);
  useEffect(() => {
    if (!token) return;

    // ✅ Determine groupId based on currentGroup
    const groupId = currentGroup?.isPersonal ? null : currentGroup?._id;
    
    console.log('📊 useBudgets: Fetching with refreshFlag:', refreshFlag, 'groupId:', groupId);
    
    getBudgets(token, groupId)
      .then((data) => {
        console.log('📊 useBudgets: Fetched successfully:', data.length);
        setBudgets([...data]);
      })
      .catch((err) => {
        console.error('❌ Error fetching budgets:', err);
        setBudgets([]);
      });
  }, [token, refreshFlag, currentGroup]); // ✅ Added currentGroup to dependencies
  return budgets;
}

// ✅ UPDATED: useTransactions now accepts currentGroup for group-aware fetching
function useTransactions(token, refreshFlag, currentGroup) {
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    if (!token) return;

    // ✅ Determine groupId based on currentGroup
    const groupId = currentGroup?.isPersonal ? null : currentGroup?._id;
    
    console.log('💳 useTransactions: Fetching with refreshFlag:', refreshFlag, 'groupId:', groupId);
    
    getTransactions(token, groupId)
      .then((data) => {
        console.log('💳 useTransactions: Fetched successfully:', data.length, 'transactions');
        setTransactions(Array.isArray(data) ? [...data] : []);
      })
      .catch((err) => {
        console.error('❌ Error fetching transactions:', err);
        setTransactions([]);
      });
  }, [token, refreshFlag, currentGroup]); // ✅ Added currentGroup to dependencies
  return transactions;
}

function DashboardButtons({ isLoggedIn, navigate, userProfile }) {
  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🗑️ localStorage cleared');
    navigate('/auth');
  };

  if (!isLoggedIn) return null;

  return (
    <div className="flex gap-2 justify-end items-center">
      {userProfile && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mr-4">
          👤 {userProfile.name}
        </div>
      )}

      <motion.button
        className="btn-secondary"
        onClick={() => navigate('/profile-setup', { state: { edit: true } })}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Update Income
      </motion.button>

      <motion.button
        className="btn-secondary bg-red-500 hover:bg-red-600 text-white"
        onClick={handleLogout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Logout
      </motion.button>
    </div>
  );
}

const Dashboard = () => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const navigate = useNavigate();
  const location = useLocation();

  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [groupRefreshFlag, setGroupRefreshFlag] = useState(0);
  const refreshFlagRef = useRef(refreshFlag);
  
  // ✅ Group states
  const [currentGroup, setCurrentGroup] = useState({ isPersonal: true });
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // ✅ NEW: Create Budget Modal state
  const [showCreateBudgetModal, setShowCreateBudgetModal] = useState(false);

  useEffect(() => {
    refreshFlagRef.current = refreshFlag;
  }, [refreshFlag]);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoadingProfile(false);
      setUserProfile(null);
      return;
    }

    setLoadingProfile(true);
    const userDataFromStorage = localStorage.getItem('user');

    if (userDataFromStorage) {
      try {
        const userData = JSON.parse(userDataFromStorage);
        console.log('👤 User data loaded from localStorage:', userData);
        setUserProfile(userData);
        setLoadingProfile(false);
      } catch (err) {
        console.error('❌ Error parsing user data from storage:', err);
        setLoadingProfile(false);
      }
    } else {
      console.warn('⚠️ No user data in localStorage');
      setLoadingProfile(false);
    }
  }, [isLoggedIn]);

  // ✅ NEW: Check if we should show the modal from TiaSuggestion
  useEffect(() => {
    if (location.state?.showCreateBudgetModal) {
      console.log('📋 Opening Create Budget Modal from TiaSuggestion');
      setShowCreateBudgetModal(true);
      // Clear the state so it doesn't persist
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ Load groups on mount or token change
  useEffect(() => {
    if (isLoggedIn && token) {
      console.log('🔄 Refreshing groups list...');
      getGroups(token)
        .then(fetchedGroups => {
          console.log('📊 Groups loaded:', fetchedGroups.length, 'groups');
          setGroups(fetchedGroups);
          
          // ✅ If current group was deleted, switch to personal
          const currentGroupExists = fetchedGroups.some(g => g._id === currentGroup?._id);
          if (!currentGroupExists && !currentGroup?.isPersonal) {
            console.log('🔀 Current group was deleted, switching to personal');
            setCurrentGroup({ isPersonal: true });
          }
        })
        .catch(err => {
          console.error('❌ Error loading groups:', err);
        });
    }
  }, [isLoggedIn, token, groupRefreshFlag]);

  // ✅ Listen for group deletion events
  useEffect(() => {
    const handleGroupDeleted = () => {
      console.log('📡 Group deletion detected, refreshing groups list');
      setGroupRefreshFlag(prev => prev + 1);
    };

    window.addEventListener('groupDeleted', handleGroupDeleted);
    return () => window.removeEventListener('groupDeleted', handleGroupDeleted);
  }, []);

  // ✅ UPDATED: Pass currentGroup to both hooks
  const budgets = useBudgets(token, refreshFlag, currentGroup);
  const transactions = useTransactions(token, refreshFlag, currentGroup);

  const handleTransactionAdded = () => {
    console.log('🔄🔄🔄 Dashboard: handleTransactionAdded CALLED!');
    console.log('🔄 Current refreshFlag:', refreshFlagRef.current);
    console.log('🔄 Current group:', currentGroup?.isPersonal ? 'Personal' : currentGroup?.name);

    setRefreshFlag((prev) => {
      const newVal = prev + 1;
      console.log('🔄 Dashboard: refreshFlag updated from', prev, 'to', newVal);
      
      console.log('📡 Dispatching transactionUpdated event to all pages');
      window.dispatchEvent(new Event('transactionUpdated'));
      
      return newVal;
    });
  };

  // ✅ Handle group creation with backend API
  const handleCreateGroup = async (groupData) => {
    try {
      const result = await createGroup(token, groupData);
      console.log('✅ Group creation result:', result);
      
      // Add new group to list
      if (result.group) {
        setGroups([...groups, result.group]);
        console.log('✅ Group added to state, total groups:', groups.length + 1);
      }
      
      return result;
    } catch (err) {
      console.error('❌ Error creating group:', err);
      throw err;
    }
  };

  // ✅ NEW: Handle budget creation success
  const handleBudgetSuccess = () => {
    console.log('✅ Budget created successfully!');
    setShowCreateBudgetModal(false);
    // Refresh budgets and transactions
    setRefreshFlag(prev => prev + 1);
  };

  // ✅ Generate Pie Chart Data from transactions
  const pieChartData = budgets
    .map(b => ({
      name: b.category,
      value: transactions
        .filter(tx => tx.category.toLowerCase() === b.category.toLowerCase() && tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0)
    }))
    .filter(item => item.value > 0);

  const categoryColors = ['#f97316', '#60a5fa', '#a855f7', '#0ea5e9', '#f43f5e', '#ffb300', '#10b981', '#06b6d4', '#6b7280'];

  // ✅ Generate Monthly Trends from transactions
  const monthlyTrendData = [
    { month: 'Jan', income: 0, expense: 0 },
    { month: 'Feb', income: 0, expense: 0 },
    { month: 'Mar', income: 0, expense: 0 },
    { month: 'Apr', income: 0, expense: 0 },
    { month: 'May', income: 0, expense: 0 },
    { month: 'Jun', income: 0, expense: 0 },
    { month: 'Jul', income: 0, expense: 0 },
    { month: 'Aug', income: 0, expense: 0 },
    { month: 'Sep', income: 0, expense: 0 },
    { month: 'Oct', income: 0, expense: 0 },
    { month: 'Nov', income: 0, expense: 0 },
    { month: 'Dec', income: 0, expense: 0 }
  ].map((month, idx) => {
    const monthNum = idx + 1;
    const monthTransactions = transactions.filter(tx => {
      const txMonth = new Date(tx.date).getMonth() + 1;
      return txMonth === monthNum;
    });
    
    return {
      month: month.month,
      income: monthTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0),
      expense: monthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0)
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        className="max-w-7xl mx-auto py-8 px-4"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {!isLoggedIn && (
          <div className="flex justify-end mb-4">
            <motion.button
              className="btn-primary px-6 py-2"
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login / Register
            </motion.button>
          </div>
        )}

        {/* Top Bar with Group Switcher */}
        <div className="flex justify-between items-center mb-6">
          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GroupSwitcher 
                currentGroup={currentGroup}
                groups={groups}
                onGroupChange={(groupId) => {
                  console.log('🔀 Switching to group:', groupId);
                  if (groupId === 'personal') {
                    console.log('📱 Switched to PERSONAL dashboard');
                    setCurrentGroup({ isPersonal: true });
                  } else {
                    const selectedGroup = groups.find(g => g._id === groupId);
                    console.log('👥 Switched to GROUP:', selectedGroup?.name);
                    setCurrentGroup(selectedGroup);
                  }
                }}
                onCreateClick={() => setShowCreateModal(true)}
              />
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DashboardButtons
              isLoggedIn={isLoggedIn}
              navigate={navigate}
              userProfile={userProfile}
            />
          </motion.div>
        </div>

        <CreateGroupModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateGroup={handleCreateGroup}
          token={token}
        />

        {/* ✅ NEW: Create Budget Modal */}
        {showCreateBudgetModal && (
          <CreateBudgetModal
            onClose={() => setShowCreateBudgetModal(false)}
            onSuccess={handleBudgetSuccess}
          />
        )}

        {/*<FinanceAnimation />*/}

        {/* User Header */}
        {isLoggedIn && userProfile && (
          <motion.div
            className="flex items-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 rounded-full mr-6 shadow-lg flex items-center justify-center text-xl font-bold text-white"
              style={{
                background: currentGroup?.isPersonal 
                  ? 'linear-gradient(135deg, #14b8a6, #06b6d4)'
                  : 'linear-gradient(135deg, #a855f7, #ec4899)'
              }}
              whileHover={{ scale: 1.1 }}
            >
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </motion.div>

            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                {userProfile.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentGroup?.isPersonal ? '📊 Personal Finance' : `👥 ${currentGroup?.name || 'Group'}`}
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Content - Smooth Page Transition */}
        <AnimatePresence mode="wait">
          {isLoggedIn && userProfile && budgets.length > 0 ? (
            currentGroup?.isPersonal ? (
              <motion.div
                key="personal-dashboard"
                initial={{ opacity: 0, x: 100, rotateY: 20 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -100, rotateY: -20 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <PersonalDashboard
                  userProfile={userProfile}
                  budgets={budgets}
                  transactions={transactions}
                  pieChartData={pieChartData}
                  monthlyTrendData={monthlyTrendData}
                  categoryColors={categoryColors}
                  onTransactionAdded={handleTransactionAdded}
                />
              </motion.div>
            ) : (
              <motion.div
                key="group-dashboard"
                initial={{ opacity: 0, x: -100, rotateY: -20 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: 100, rotateY: 20 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <GroupDashboard
                  currentGroup={currentGroup}
                  budgets={budgets}
                  transactions={transactions}
                  monthlyTrendData={monthlyTrendData}
                  onTransactionAdded={handleTransactionAdded}
                  token={token}
                  userProfile={userProfile}
                />
              </motion.div>
            )
          ) : isLoggedIn && (!budgets || budgets.length === 0) ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key="no-budget"
            >
              <div className="text-lg text-gray-600 mb-8">📋 No budget plan is set yet.</div>
              <motion.button
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition text-lg"
                onClick={() => setShowCreateBudgetModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✨ Create Your Flow
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key="login-prompt"
            >
              <p className="text-gray-500 text-lg">🔐 Login to see your dashboard</p>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoggedIn && <ChatWidget onTransactionAdded={handleTransactionAdded} />}
      </motion.div>
    </div>
  );
};

export default Dashboard;
