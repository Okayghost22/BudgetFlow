// src/api/transactions.js

// ✅ GET TRANSACTIONS - Support both personal and group with optional groupId
export async function getTransactions(token, groupId = null) {
  let url = `${import.meta.env.VITE_API_URL}/transactions`;
  
  // ✅ Add groupId as query parameter if provided
  if (groupId && groupId !== 'null') {
    url += `?groupId=${groupId}`;
    console.log('👥 Fetching GROUP transactions:', groupId);
  } else {
    console.log('📱 Fetching PERSONAL transactions');
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Transactions fetched:', data.length);
    return data;
  } catch (err) {
    console.error('❌ Error fetching transactions:', err.message);
    throw err;
  }
}

// ✅ ADD TRANSACTION - Support both personal and group
export async function addTransaction(token, data) {
  console.log('💳 Adding transaction:', data);
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add transaction');
    }

    const newTransaction = await response.json();
    console.log('✅ Transaction created:', newTransaction._id);
    return newTransaction;
  } catch (err) {
    console.error('❌ Error adding transaction:', err.message);
    throw err;
  }
}

// ✅ DELETE TRANSACTION - Support both personal and group
export async function deleteTransaction(token, id) {
  console.log('🗑️ Deleting transaction:', id);
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/transactions/${id}`,
      {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete transaction');
    }

    const data = await response.json();
    console.log('✅ Transaction deleted');
    return data;
  } catch (err) {
    console.error('❌ Error deleting transaction:', err.message);
    throw err;
  }
}

// ✅ UPDATE TRANSACTION - Support both personal and group
export async function updateTransaction(token, id, data) {
  console.log('✏️ Updating transaction:', id, data);
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/transactions/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        cache: "no-store"
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update transaction');
    }

    const updatedTransaction = await response.json();
    console.log('✅ Transaction updated');
    return updatedTransaction;
  } catch (err) {
    console.error('❌ Error updating transaction:', err.message);
    throw err;
  }
}

// ✅ GET GROUP TRANSACTION SUMMARY - For group dashboard analytics
export async function getGroupTransactionSummary(token, groupId) {
  console.log('📊 Fetching group transaction summary:', groupId);
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/transactions/group/${groupId}/summary`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch group summary');
    }

    const summary = await response.json();
    console.log('✅ Group summary fetched:', summary);
    return summary;
  } catch (err) {
    console.error('❌ Error fetching group summary:', err.message);
    throw err;
  }
}
