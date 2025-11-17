import React, { useEffect, useState } from 'react';
import { getBudgets } from '../api/budgets';

function BudgetsCard({ token, refreshFlag }) {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    getBudgets(token).then(setBudgets);
  }, [token, refreshFlag]); // <-- Add refreshFlag to dependency array!

  return (
    <div>
      <h2>Budgets</h2>
      <ul>
        {budgets.map(b => (
          <li key={b._id}>{b.category}: ₹{b.limit ?? b.amount ?? 0}</li>
        ))}
      </ul>
    </div>
  );
}
export default BudgetsCard;
