// src/api/budgets.js

export async function getBudgets(token) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/user/budgets`, {
    method: 'GET',
    headers: { 
      Authorization: `Bearer ${token}` 
    },
    cache: "no-store"
  });
  if (!response.ok) throw new Error('Failed to fetch budgets');
  return response.json();
}

export async function saveBudgets(token, budgets) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/user/budgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ budgets }),
    cache: "no-store"
  });
  if (!res.ok) throw new Error('Failed to save budgets');
  return res.json();
}
