import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveUserProfile, getUserProfile } from '../api/user';

export default function UserProfileSetup() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [salary, setSalary] = useState('');
  const [businessIncome, setBusinessIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch user profile, prefill fields
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }
    getUserProfile(token)
      .then(profile => {
        if (profile.age && profile.sex && (profile.salary !== undefined) && (profile.businessIncome !== undefined)) {
          // If complete and not an edit intent, redirect
          if (!location.state?.edit) {
            navigate('/dashboard');
            return;
          }
        }
        // Pre-fill fields for user if present
        if (profile.name) setName(profile.name);
        if (profile.age) setAge(profile.age);
        if (profile.sex) setSex(profile.sex);
        if (profile.salary !== undefined) setSalary(profile.salary);
        if (profile.businessIncome !== undefined) setBusinessIncome(profile.businessIncome);
        setFetching(false);
      })
      .catch(() => {
        setError('Failed to load profile.');
        setFetching(false);
      });
  }, [navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !age || !sex || (!salary && !businessIncome)) {
      setError('Please fill all fields including at least one income source');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await saveUserProfile(token, {
        name,
        age: Number(age),
        sex,
        salary: Number(salary) || 0,
        businessIncome: Number(businessIncome) || 0,
        totalIncome: (Number(salary) || 0) + (Number(businessIncome) || 0)
      });
      navigate('/tia-suggestion');
    } catch {
      setError('Failed to save profile. Please try again.');
    }
    setLoading(false);
  };

  if (fetching) return <div className="text-center py-16">Loading profile…</div>;

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-6 text-primary-600">Profile Setup</h2>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <input
          className="input-field" type="text" placeholder="Name"
          value={name} onChange={e => setName(e.target.value)}
        />
        <input
          className="input-field" type="number" placeholder="Age"
          value={age} onChange={e => setAge(e.target.value)}
        />
        <select
          className="input-field" value={sex} onChange={e => setSex(e.target.value)}
        >
          <option value="">Select Sex</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
          <option value="O">Other</option>
        </select>
        <input
          className="input-field" type="number" placeholder="Salary Income (₹)"
          value={salary} onChange={e => setSalary(e.target.value)}
        />
        <input
          className="input-field" type="number" placeholder="Business Income (₹)"
          value={businessIncome} onChange={e => setBusinessIncome(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button
          className="btn-primary w-full" type="submit" disabled={loading}
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
