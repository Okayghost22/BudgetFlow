// backend/routes/transactions.js
const express = require('express');
const Joi = require('joi');
const Transaction = require('../models/Transaction');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

const router = express.Router();

const transactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().required(),
  description: Joi.string().allow(''),
  date: Joi.date().required(),
  groupId: Joi.string().allow(null, ''),
});

// ✅ GET TRANSACTIONS - Support both personal and group transactions - FIXED!
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.query;

    console.log('📊 Fetching transactions for user:', userId, 'groupId:', groupId);

    let filter = {};

    if (groupId && groupId !== 'null' && groupId !== '') {
      // ✅ GROUP TRANSACTIONS
      console.log('👥 Fetching GROUP transactions for groupId:', groupId);
      
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const isMember = group.members.some(m => m.user.toString() === userId);
      if (!isMember && group.createdBy.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized - not a group member' });
      }

      filter.groupId = groupId;
    } else {
      // ✅ PERSONAL TRANSACTIONS - FIXED: Use null instead of $in array
      console.log('📱 Fetching PERSONAL transactions for user:', userId);
      filter.userId = userId;
      filter.groupId = null; // ✅ CRITICAL FIX: Only check for null, not array
    }

    const txs = await Transaction.find(filter)
      .sort({ date: -1 })
      .lean();

    console.log('✅ Transactions fetched:', txs.length);
    res.json(txs);
  } catch (err) {
    console.error('❌ Error fetching transactions:', err.message);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

// ✅ ADD TRANSACTION - Support both personal and group
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, ...txData } = req.body;

    console.log('💳 Creating transaction for user:', userId);
    console.log('💳 Transaction data:', req.body);

    // Validate transaction data
    const { error } = transactionSchema.validate(req.body);
    if (error) {
      console.error('❌ Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    // ✅ IF GROUPID PROVIDED: Verify user is member of that group
    if (groupId && groupId !== 'null' && groupId !== '') {
      console.log('👥 Creating GROUP transaction for groupId:', groupId);

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const isMember = group.members.some(m => m.user.toString() === userId);
      if (!isMember && group.createdBy.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized - not a group member' });
      }
    } else {
      console.log('📱 Creating PERSONAL transaction for user:', userId);
    }

    // ✅ FIXED: Use userId instead of user
    const tx = new Transaction({
      userId: userId,
      groupId: (groupId && groupId !== 'null' && groupId !== '') ? groupId : null,
      ...txData
    });

    await tx.save();

    console.log('✅ Transaction created:', tx._id);
    res.status(201).json(tx);
  } catch (err) {
    console.error('❌ Error creating transaction:', err.message);
    res.status(500).json({ error: 'Error creating transaction' });
  }
});

// ✅ DELETE TRANSACTION - Support both personal and group
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const txId = req.params.id;

    console.log('🗑️ Deleting transaction:', txId);

    // Find the transaction first
    const tx = await Transaction.findById(txId);
    if (!tx) {
      console.error('❌ Transaction not found');
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // ✅ FIXED: Check userId instead of user
    if (tx.userId.toString() !== userId) {
      // If group transaction, verify user is admin or creator
      if (tx.groupId) {
        const group = await Group.findById(tx.groupId);
        const userMember = group.members.find(m => m.user.toString() === userId);
        
        if (!userMember && group.createdBy.toString() !== userId) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
      } else {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    // Delete transaction
    await Transaction.deleteOne({ _id: txId });

    console.log('✅ Transaction deleted');
    res.json({ message: 'Transaction deleted', deletedId: txId });
  } catch (err) {
    console.error('❌ Error deleting transaction:', err.message);
    res.status(500).json({ error: 'Error deleting transaction' });
  }
});

// ✅ UPDATE TRANSACTION - Support both personal and group
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const txId = req.params.id;

    console.log('✏️ Updating transaction:', txId);

    // Validate update data
    const { error } = transactionSchema.validate(req.body);
    if (error) {
      console.error('❌ Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find the transaction first
    const tx = await Transaction.findById(txId);
    if (!tx) {
      console.error('❌ Transaction not found');
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // ✅ FIXED: Check userId instead of user
    if (tx.userId.toString() !== userId) {
      // If group transaction, verify user is admin or creator
      if (tx.groupId) {
        const group = await Group.findById(tx.groupId);
        const userMember = group.members.find(m => m.user.toString() === userId);
        
        if (!userMember && group.createdBy.toString() !== userId) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
      } else {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    // Update transaction
    const updatedTx = await Transaction.findByIdAndUpdate(
      txId,
      { $set: req.body },
      { new: true }
    );

    console.log('✅ Transaction updated');
    res.json(updatedTx);
  } catch (err) {
    console.error('❌ Error updating transaction:', err.message);
    res.status(500).json({ error: 'Error updating transaction' });
  }
});

// ✅ GET GROUP TRANSACTION SUMMARY (For group dashboard)
router.get('/group/:groupId/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    console.log('📊 Fetching group transaction summary for groupId:', groupId);

    // Verify user is member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(m => m.user.toString() === userId);
    if (!isMember && group.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get all group transactions
    const transactions = await Transaction.find({ groupId })
      .populate('userId', 'name email')
      .sort({ date: -1 });

    // Calculate summary
    const totalIncome = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Per member breakdown
    const memberSummary = {};
    transactions.forEach(tx => {
      const memberName = tx.userId?.name || 'Unknown';
      if (!memberSummary[memberName]) {
        memberSummary[memberName] = { paid: 0, owed: 0 };
      }
      if (tx.type === 'expense') {
        memberSummary[memberName].paid += tx.amount;
      }
    });

    console.log('✅ Group summary calculated');
    res.json({
      totalIncome,
      totalExpense,
      transactionCount: transactions.length,
      memberSummary,
      transactions
    });
  } catch (err) {
    console.error('❌ Error fetching group summary:', err.message);
    res.status(500).json({ error: 'Error fetching group summary' });
  }
});

module.exports = router;
