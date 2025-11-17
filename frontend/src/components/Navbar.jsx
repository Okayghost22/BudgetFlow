import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, PlusCircle, Wallet, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isLoggedIn = !!localStorage.getItem('token');

  // ✅ CRITICAL: Hide navbar completely on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  // ✅ Only show navbar if user is logged in
  if (!isLoggedIn) {
    return null;
  }

  // ✅ Navigation items - NO ALWAYS FLAG
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/transactions', icon: TrendingUp, label: 'Transactions' },
    { path: '/add', icon: PlusCircle, label: 'Add' },
    { path: '/budgets', icon: Wallet, label: 'Budgets' }
  ];

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center"
            >
              <Wallet className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              BudgetFlow
            </span>
          </Link>

          {/* Nav Items - Desktop */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <div
                    className={`flex items-center space-x-2 ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              title="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </motion.button>

            {/* Logout Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex justify-around pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
          {/* Mobile Logout */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 text-red-600 dark:text-red-400"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs mt-1">Logout</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
