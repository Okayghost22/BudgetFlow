import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveBudgets } from '../api/user';

const defaultCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Booze', 'Health', 'Education', 'Other'];

export default function ManualBudgetSetup() {
  const [budgets, setBudgets] = useState(
    defaultCategories.map(cat => ({ category: cat, limit: '' }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (idx, value) => {
    setBudgets(budgets.map((b, i) => i === idx ? { ...b, limit: value.replace(/\D/, '') } : b));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (budgets.some(b => !b.limit)) {
      setError('Fill all categories.');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await saveBudgets(token, budgets.map(b => ({ category: b.category, amount: Number(b.limit) })));
      navigate('/dashboard');
    } catch {
      setError('Failed to save budgets');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-4 text-primary-600">Create Your Flow</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {budgets.map((b, i) => (
          <div key={b.category} className="flex items-center gap-3">
            <label className="w-32">{b.category}</label>
            <input
              className="input-field flex-1"
              placeholder="Enter limit (₹)"
              value={b.limit}
              onChange={e => handleChange(i, e.target.value)}
              type="number"
              min="0"
              required
            />
          </div>
        ))}
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Budget Plan'}
        </button>
      </form>
    </div>
  );
}
