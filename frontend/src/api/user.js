export async function saveUserProfile(token, profile) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile)
  });
  if (!response.ok) throw new Error('Profile save failed');
  return response.json();
}

export async function getUserProfile(token) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export async function saveBudgets(token, budgets) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/user/budgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ budgets })
  });
  if (!res.ok) throw new Error('Failed to save budgets');
  return res.json();
}

export async function getBudgets(token) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/user/budgets`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch budgets');
  return res.json();
}
