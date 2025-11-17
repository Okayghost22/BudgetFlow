import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, saveBudgets } from '../api/user';

const TIA_RULES = [
  { category: 'Food', percent: 20 },
  { category: 'Transport', percent: 10 },
  { category: 'Shopping', percent: 12 },
  { category: 'Bills', percent: 14 },
  { category: 'Entertainment', percent: 8 },
  { category: 'Booze', percent: 6 },
  { category: 'Health', percent: 7 },
  { category: 'Education', percent: 8 },
  { category: 'Other', percent: 5 }
];

const categoryIcons = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '💡',
  Entertainment: '🎬',
  Booze: '🍺',
  Health: '🏥',
  Education: '📚',
  Other: '📦'
};

const categoryColors = {
  Food: '#f97316',
  Transport: '#60a5fa',
  Shopping: '#a855f7',
  Bills: '#0ea5e9',
  Entertainment: '#f43f5e',
  Booze: '#ffb300',
  Health: '#10b981',
  Education: '#06b6d4',
  Other: '#6b7280'
};

export default function TiaSuggestionPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    getUserProfile(token)
      .then((data) => { setProfile(data); setLoading(false); })
      .catch(() => { setError('Could not load profile'); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="text-lg text-primary-600 animate-pulse">TIA is preparing your budget recommendation...</div>
    </div>
  );

  if (!profile) return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="text-red-500 bg-white py-8 px-8 rounded shadow-md">{error || 'No user profile loaded.'}</div>
    </div>
  );

  // Real calculation based on user data
  const salary = Number(profile.salary) || 0;
  const businessIncome = Number(profile.businessIncome) || 0;
  const totalIncome = salary + businessIncome;
  
  const tiaSuggestion = TIA_RULES.map(item => ({
    ...item,
    amount: Math.round((item.percent * totalIncome) / 100)
  }));
  const totalBudget = tiaSuggestion.reduce((sum, cur) => sum + cur.amount, 0);

  const handleAccept = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      await saveBudgets(token, tiaSuggestion);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Failed to save budget suggestion');
    }
    setSaving(false);
  };

  // ✅ FIXED: Pass state with flag to show "Create Your Flow"
  const handleDeny = () => {
    navigate('/dashboard', { 
      replace: true, 
      state: { showCreateBudgetModal: true } 
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh]">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-primary-600 text-center">Hi, I'm TIA!</h2>
        <div className="mb-6 text-center">
          <p className="mb-2 text-lg">
            <span className="font-semibold">Hello {profile.name}</span>
            {` (Age ${profile.age || '-'}, Sex ${profile.sex || '-'})`}
            <br />
            Based on your <span className="font-medium">total monthly income</span> <span className="text-primary-700 font-bold">₹{totalIncome}</span>, here's my suggested way to split your budget:
          </p>
        </div>
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Category</th>
              <th className="py-2 text-center">% Split</th>
              <th className="py-2 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {tiaSuggestion.map(cat => (
              <tr key={cat.category} className="h-10 border-b">
                <td className="flex items-center gap-2 py-1 font-medium" style={{ color: categoryColors[cat.category] }}>
                  <span className="text-xl">{categoryIcons[cat.category]}</span>
                  <span>{cat.category}</span>
                </td>
                <td className="text-center">{cat.percent}%</td>
                <td className="text-right font-semibold">₹{cat.amount.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-bold text-primary-600">
              <td className="py-2">Total</td>
              <td className="text-center">100%</td>
              <td className="text-right">₹{totalBudget.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <button 
            className="bg-primary-600 text-white font-bold px-6 py-3 rounded shadow hover:bg-primary-700 transition" 
            onClick={handleAccept} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Accept & Apply Plan'}
          </button>
          <button 
            className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded shadow border hover:bg-gray-200 transition" 
            onClick={handleDeny} 
            disabled={saving}
          >
            Deny & Create Your Own
          </button>
        </div>
      </div>
    </div>
  );
}
