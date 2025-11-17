// src/api/groups.js
// ✅ HARDCODED FOR NOW - No process.env needed
const API_URL = 'http://localhost:5000/api';

// ✅ CREATE GROUP
export const createGroup = async (token, groupData) => {
  console.log('📤 Creating group:', groupData);
  console.log('🌐 API URL:', API_URL);
  
  try {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(groupData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create group');
    }

    const data = await response.json();
    console.log('✅ Group created:', data);
    return data;
  } catch (err) {
    console.error('❌ Error creating group:', err);
    throw err;
  }
};

// ✅ GET ALL GROUPS
export const getGroups = async (token) => {
  console.log('📥 Fetching all groups...');
  try {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }

    const data = await response.json();
    console.log('✅ Groups fetched:', data.length);
    return data;
  } catch (err) {
    console.error('❌ Error fetching groups:', err);
    throw err;
  }
};

// ✅ GET SINGLE GROUP
export const getGroup = async (token, groupId) => {
  console.log('📥 Fetching group:', groupId);
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch group');
    }

    const data = await response.json();
    console.log('✅ Group fetched:', data);
    return data;
  } catch (err) {
    console.error('❌ Error fetching group:', err);
    throw err;
  }
};

// ✅ GET GROUP MEMBERS WITH ROLES
export const getGroupMembers = async (token, groupId) => {
  console.log('👥 Fetching group members:', groupId);
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch members');
    }

    const data = await response.json();
    console.log('✅ Group members fetched:', data.members.length);
    return data;
  } catch (err) {
    console.error('❌ Error fetching members:', err);
    throw err;
  }
};

// ✅ GET CURRENT USER'S ROLE IN GROUP
export const getUserRoleInGroup = async (token, groupId) => {
  console.log('🔍 Checking user role in group:', groupId);
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}/my-role`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user role');
    }

    const data = await response.json();
    console.log('✅ User role fetched:', data.role, '| Is Admin:', data.isAdmin);
    return data;
  } catch (err) {
    console.error('❌ Error fetching user role:', err);
    throw err;
  }
};

// ✅ PROMOTE MEMBER TO ADMIN
export const promoteToAdmin = async (token, groupId, memberId) => {
  console.log('👑 Promoting member to admin:', { groupId, memberId });
  try {
    const response = await fetch(
      `${API_URL}/groups/${groupId}/members/${memberId}/promote`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to promote member');
    }

    const data = await response.json();
    console.log('✅ Member promoted to admin');
    return data;
  } catch (err) {
    console.error('❌ Error promoting member:', err);
    throw err;
  }
};

// ✅ DEMOTE ADMIN TO MEMBER
export const demoteToMember = async (token, groupId, memberId) => {
  console.log('👤 Demoting admin to member:', { groupId, memberId });
  try {
    const response = await fetch(
      `${API_URL}/groups/${groupId}/members/${memberId}/demote`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to demote member');
    }

    const data = await response.json();
    console.log('✅ Admin demoted to member');
    return data;
  } catch (err) {
    console.error('❌ Error demoting member:', err);
    throw err;
  }
};
// ✅ DELETE GROUP (Creator only)
export const deleteGroup = async (token, groupId) => {
  console.log('🗑️ Deleting group:', groupId);

  try {
    const response = await fetch(`${API_URL}/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete group');
    }

    const data = await response.json();
    console.log('✅ Group deleted');
    return data;
  } catch (err) {
    console.error('❌ Error deleting group:', err);
    throw err;
  }
};

// ✅ REMOVE MEMBER FROM GROUP
export const removeMember = async (token, groupId, memberId) => {
  console.log('🗑️ Removing member from group:', { groupId, memberId });
  try {
    const response = await fetch(
      `${API_URL}/groups/${groupId}/members/${memberId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove member');
    }

    const data = await response.json();
    console.log('✅ Member removed from group');
    return data;
  } catch (err) {
    console.error('❌ Error removing member:', err);
    throw err;
  }
};

// ✅ LEAVE GROUP
export const leaveGroup = async (token, groupId) => {
  console.log('👋 Leaving group:', groupId);
  try {
    const response = await fetch(
      `${API_URL}/groups/${groupId}/leave`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to leave group');
    }

    const data = await response.json();
    console.log('✅ Successfully left group');
    return data;
  } catch (err) {
    console.error('❌ Error leaving group:', err);
    throw err;
  }
};
