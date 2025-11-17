import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <nav className="landing-navbar">
        <div className="navbar-container">
          <div className="logo">
            <span className="logo-icon">💰</span>
            <span className="logo-text">BudgetFlow</span>
          </div>
          <button 
            className="login-btn"
            onClick={() => navigate('/auth')}
          >
            Login / Register
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <h1 className="hero-title">
            Take Control of Your Money
          </h1>
          <p className="hero-subtitle">
            Track expenses, manage budgets, and achieve your financial goals with BudgetFlow
          </p>
          <div className="hero-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="illustration">
            <div className="chart"></div>
            <div className="chart"></div>
            <div className="chart"></div>
          </div>
        </div>
      </motion.section>

      {/* FEATURES SECTION */}
      <section className="features">
        <div className="container">
          <h2>Why Choose BudgetFlow?</h2>
          <div className="features-grid">
            {[
              {
                icon: '📊',
                title: 'Smart Tracking',
                description: 'Track all your expenses automatically and see where your money goes'
              },
              {
                icon: '💡',
                title: 'Budget Planning',
                description: 'Create smart budgets for different categories and monitor spending'
              },
              {
                icon: '👥',
                title: 'Group Finance',
                description: 'Manage shared expenses with family and friends effortlessly'
              },
              {
                icon: '📈',
                title: 'Insights',
                description: 'Get detailed analytics and reports on your spending habits'
              },
              {
                icon: '🔒',
                title: 'Secure',
                description: 'Your financial data is encrypted and always protected'
              },
              {
                icon: '⚡',
                title: 'Real-time',
                description: 'Updates happen instantly so you stay informed always'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="feature-card"
                whileHover={{ y: -10 }}
                onHoverStart={() => setHoveredCard(idx)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                {hoveredCard === idx && (
                  <motion.div 
                    className="feature-hover"
                    layoutId="feature-hover"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            {[
              { num: '1', title: 'Sign Up', desc: 'Create your free BudgetFlow account in seconds' },
              { num: '2', title: 'Add Transactions', desc: 'Log your expenses as you spend' },
              { num: '3', title: 'Set Budgets', desc: 'Create budgets for different categories' },
              { num: '4', title: 'Track & Optimize', desc: 'Monitor spending and adjust budgets monthly' }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                className="step"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: idx * 0.2 }}
              >
                <div className="step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <motion.section 
        className="cta"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <div className="container">
          <h2>Ready to Master Your Money?</h2>
          <p>Start tracking your expenses today - it takes less than a minute to sign up</p>
          <button 
            className="btn btn-primary btn-large"
            onClick={() => navigate('/auth')}
          >
            Create Free Account
          </button>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>BudgetFlow</h4>
              <p>Your personal finance companion</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How it works</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 BudgetFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ✅ CREATOR SECTION - NEW */}
      <motion.section 
        className="creator-section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="creator-container">
          <div className="creator-content">
            <h3 className="creator-title">Made by Shivam Kumar Jha</h3>
            <p className="creator-phone"> 6207377118</p>
            <p className="creator-passion">Made with <span className="heart">❤️</span> Love and Passion</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default LandingPage;
