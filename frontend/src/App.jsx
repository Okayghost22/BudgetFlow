import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import Budgets from './pages/Budgets';
import Auth from './pages/Auth';
import UserProfileSetup from './pages/UserProfileSetup';
import ManualBudgetSetup from './pages/ManualBudgetSetup';
import TiaSuggestionPage from './pages/TiaSuggestionPage';
import AcceptInvite from './pages/AcceptInvite';

// ✅ Protected Route Component
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return children;
}

// ✅ Conditional Navbar - Hide navbar on landing page
function ConditionalNavbar() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  
  if (isLanding) {
    return null; // Hide navbar on landing page
  }
  
  return <Navbar />;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* ✅ Conditional Navbar */}
        <ConditionalNavbar />
        
        <Routes>
          {/* ✅ PUBLIC ROUTES - No authentication required */}
          {/* Landing Page - Home */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Page */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Accept Invite - No auth required (user might not be logged in) */}
          <Route path="/accept-invite/:groupId/:token" element={<AcceptInvite />} />

          {/* ✅ PROTECTED ROUTES - Require authentication */}
          {/* Main Dashboard - after login shows personal + groups */}
          <Route 
            path="/dashboard" 
            element={<RequireAuth><Dashboard /></RequireAuth>} 
          />

          {/* Profile Setup */}
          <Route 
            path="/profile-setup" 
            element={<RequireAuth><UserProfileSetup /></RequireAuth>} 
          />

          {/* Transactions */}
          <Route 
            path="/transactions" 
            element={<RequireAuth><Transactions /></RequireAuth>} 
          />

          {/* Add Transaction */}
          <Route 
            path="/add" 
            element={<RequireAuth><AddTransaction /></RequireAuth>} 
          />

          {/* Budgets */}
          <Route 
            path="/budgets" 
            element={<RequireAuth><Budgets /></RequireAuth>} 
          />

          {/* Budget Setup */}
          <Route 
            path="/budget-setup" 
            element={<RequireAuth><ManualBudgetSetup /></RequireAuth>} 
          />

          {/* Tia Suggestion */}
          <Route 
            path="/tia-suggestion" 
            element={<RequireAuth><TiaSuggestionPage /></RequireAuth>} 
          />

          {/* ✅ Catch all - redirect to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
