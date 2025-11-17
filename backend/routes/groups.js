// backend/routes/groups.js
const express = require('express');
const crypto = require('crypto');
const { sendInviteEmail } = require('../utils/sendMail');
const Group = require('../models/Group');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

const router = express.Router();

// ✅ MIDDLEWARE: Check if user is admin of a group
async function checkGroupAdmin(req, res, next) {
  try {
    const userId = req.user.id;
    const groupId = req.params.groupId || req.body.groupId;

    console.log('🔐 Checking admin privileges for user:', userId, 'in group:', groupId);

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const userMember = group.members.find(m => m.user.toString() === userId);
    if (!userMember) {
      return res.status(403).json({ error: 'Not a group member' });
    }

    if (userMember.role !== 'admin') {
      console.log('❌ User is not admin, role:', userMember.role);
      return res.status(403).json({ error: 'Admin role required for this action' });
    }

    console.log('✅ User is admin of group');
    req.group = group;
    next();
  } catch (err) {
    console.error('❌ Authorization error:', err.message);
    res.status(500).json({ error: 'Authorization error' });
  }
}

// ✅ CREATE GROUP + SEND INVITES
router.post('/', auth, async (req, res) => {
  const { name, members } = req.body;
  const creatorId = req.user.id;

  try {
    // Validate
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name required' });
    }

    console.log('🔧 Creating group:', { name, creatorId });

    // Create group
    const group = new Group({
      name: name.trim(),
      createdBy: creatorId,
      members: [
        {
          user: creatorId,
          role: 'admin',
          status: 'active'
        }
      ]
    });

    let validEmails = [];

    // Process invites
    if (members && members.length > 0) {
      validEmails = members.filter(e => e && e.trim() && e.includes('@'));

      for (let email of validEmails) {
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        group.invites.push({
          email: email.trim(),
          inviteToken,
          status: 'pending',
          expiresAt
        });

        // Send email
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite/${group._id}/${inviteToken}`;
        try {
          await sendInviteEmail(email.trim(), name, inviteLink);
          console.log(`📧 Invite sent to ${email}`);
        } catch (err) {
          console.error(`❌ Failed to send email to ${email}:`, err.message);
        }
      }
    }

    // Save group to DB
    await group.save();
    console.log('✅ Group saved to DB:', group._id);

    res.status(201).json({
      success: true,
      group: {
        _id: group._id,
        name: group.name,
        members: group.members,
        invites: group.invites
      },
      message: `Group "${name}" created! Invites sent to ${validEmails.length} members.`
    });
  } catch (err) {
    console.error('❌ Group creation error:', err);
    res.status(500).json({
      error: err.message || 'Failed to create group',
      details: err.toString()
    });
  }
});

// ✅ GET ALL GROUPS FOR USER
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { createdBy: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).populate('createdBy', 'name email').populate('members.user', 'name email');

    console.log('📊 Fetched', groups.length, 'groups for user:', req.user.id);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// ✅ GET SINGLE GROUP
router.get('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is member
    const isMember = group.members.some(m => m.user._id.toString() === req.user.id);
    if (!isMember && group.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// ✅ ACCEPT GROUP INVITE
router.post('/:groupId/accept-invite', auth, async (req, res) => {
  const { token } = req.body;
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    console.log('🔗 Accepting invite:', { groupId, token, userId });

    // Find group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Find invite
    const invite = group.invites.find(inv => inv.inviteToken === token);
    if (!invite) {
      return res.status(400).json({ error: 'Invalid invite token' });
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      return res.status(400).json({ error: 'Invite has expired' });
    }

    // Check if already a member
    const isMember = group.members.some(m => m.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({ error: 'Already a member of this group' });
    }

    // Add user as member
    group.members.push({
      user: userId,
      role: 'member',
      status: 'active'
    });

    // Mark invite as accepted
    invite.status = 'accepted';

    await group.save();
    console.log('✅ User added to group:', userId);

    // Populate user info for response
    const updatedGroup = await group.populate('members.user', 'name email');

    res.json({
      success: true,
      group: {
        _id: updatedGroup._id,
        name: updatedGroup.name,
        members: updatedGroup.members
      },
      message: `Successfully joined ${updatedGroup.name}!`
    });
  } catch (err) {
    console.error('❌ Error accepting invite:', err);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
});

// ✅ GET GROUP MEMBERS WITH ROLES
router.get('/:groupId/members', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check authorization
    const isMember = group.members.some(m => m.user._id.toString() === req.user.id);
    if (!isMember && group.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get current user's role
    const currentUserMember = group.members.find(m => m.user._id.toString() === req.user.id);
    const isAdmin = currentUserMember?.role === 'admin' || group.createdBy._id.toString() === req.user.id;

    console.log('📋 Fetched members for group:', group.name, 'User is admin:', isAdmin);

    res.json({
      members: group.members,
      totalMembers: group.members.length,
      isAdmin,
      currentUserId: req.user.id,
      groupCreatorId: group.createdBy._id.toString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// ✅ REMOVE MEMBER FROM GROUP (Admin only)
router.delete('/:groupId/members/:memberId', auth, checkGroupAdmin, async (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.user.id;

  try {
    console.log('🗑️ Removing member:', memberId, 'from group:', groupId);

    // Prevent self-removal
    if (memberId === userId) {
      return res.status(400).json({ error: 'Cannot remove yourself. Leave the group instead.' });
    }

    const group = req.group;

    // Remove member
    group.members = group.members.filter(m => m.user.toString() !== memberId);

    await group.save();
    console.log('✅ Member removed from group:', memberId);

    res.json({
      success: true,
      message: 'Member removed from group'
    });
  } catch (err) {
    console.error('❌ Error removing member:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// ✅ PROMOTE MEMBER TO ADMIN (Admin only)
router.post('/:groupId/members/:memberId/promote', auth, checkGroupAdmin, async (req, res) => {
  const { groupId, memberId } = req.params;

  try {
    console.log('👑 Promoting member:', memberId, 'to admin in group:', groupId);

    const group = req.group;

    // Find member
    const member = group.members.find(m => m.user.toString() === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found in group' });
    }

    // Check if already admin
    if (member.role === 'admin') {
      return res.status(400).json({ error: 'Member is already an admin' });
    }

    // Promote to admin
    member.role = 'admin';

    await group.save();
    console.log('✅ Member promoted to admin:', memberId);

    res.json({
      success: true,
      message: 'Member promoted to admin',
      member
    });
  } catch (err) {
    console.error('❌ Error promoting member:', err);
    res.status(500).json({ error: 'Failed to promote member' });
  }
});

// ✅ DEMOTE ADMIN TO MEMBER (Admin only)
router.post('/:groupId/members/:memberId/demote', auth, checkGroupAdmin, async (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.user.id;

  try {
    console.log('👤 Demoting admin:', memberId, 'to member in group:', groupId);

    const group = req.group;

    // Prevent demoting the group creator
    if (group.createdBy.toString() === memberId) {
      return res.status(400).json({ error: 'Cannot demote the group creator' });
    }

    // Find member
    const member = group.members.find(m => m.user.toString() === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found in group' });
    }

    // Check if already member
    if (member.role === 'member') {
      return res.status(400).json({ error: 'Member is already a regular member' });
    }

    // Demote to member
    member.role = 'member';

    await group.save();
    console.log('✅ Admin demoted to member:', memberId);

    res.json({
      success: true,
      message: 'Admin demoted to member',
      member
    });
  } catch (err) {
    console.error('❌ Error demoting admin:', err);
    res.status(500).json({ error: 'Failed to demote admin' });
  }
});

// ✅ GET USER'S ROLE IN GROUP
router.get('/:groupId/my-role', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    console.log('🔍 Checking user role in group:', groupId);

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is member
    const userMember = group.members.find(m => m.user.toString() === userId);
    const isCreator = group.createdBy.toString() === userId;
    const isAdmin = userMember?.role === 'admin' || isCreator;

    res.json({
      role: userMember?.role || null,
      isAdmin,
      isCreator,
      isMember: !!userMember
    });
  } catch (err) {
    console.error('❌ Error checking user role:', err);
    res.status(500).json({ error: 'Failed to check user role' });
  }
});

// ✅ LEAVE GROUP
router.post('/:groupId/leave', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    console.log('👋 User leaving group:', groupId);

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is in group
    const isMember = group.members.some(m => m.user.toString() === userId);
    if (!isMember) {
      return res.status(400).json({ error: 'You are not a member of this group' });
    }

    // Prevent creator from leaving (must transfer ownership or delete group)
    if (group.createdBy.toString() === userId) {
      return res.status(400).json({ error: 'Group creator cannot leave. Delete the group or transfer ownership.' });
    }

    // Remove user from members
    group.members = group.members.filter(m => m.user.toString() !== userId);

    await group.save();
    console.log('✅ User left group:', userId);

    res.json({
      success: true,
      message: 'Successfully left the group'
    });
  } catch (err) {
    console.error('❌ Error leaving group:', err);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// ✅ DELETE GROUP (Creator/Owner only) - FIXED POSITION
router.delete('/:groupId', auth, async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    console.log('🗑️ Deleting group:', groupId);
    console.log('👤 User attempting delete:', userId);

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    console.log('📋 Group creator:', group.createdBy);
    console.log('🔐 Comparing:', String(group.createdBy), '===', String(userId));

    // ✅ Only creator can delete group
    if (String(group.createdBy) !== String(userId)) {
      return res.status(403).json({ error: 'Only group creator can delete this group' });
    }

    // ✅ Delete all group budgets
    await Budget.deleteMany({ groupId });
    console.log('✅ Group budgets deleted');

    // ✅ Delete all group transactions
    await Transaction.deleteMany({ groupId });
    console.log('✅ Group transactions deleted');

    // ✅ Delete the group itself
    await Group.deleteOne({ _id: groupId });
    console.log('✅ Group deleted');

    res.json({
      success: true,
      message: 'Group and all associated data deleted successfully'
    });
  } catch (err) {
    console.error('❌ Error deleting group:', err);
    res.status(500).json({ error: 'Failed to delete group: ' + err.message });
  }
});

module.exports = router;
