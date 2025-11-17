const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        email: String,
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member'
        },
        status: {
          type: String,
          enum: ['active', 'pending', 'invited'],
          default: 'active'
        }
      }
    ],
    invites: [
      {
        email: String,
        inviteToken: String,
        status: {
          type: String,
          enum: ['pending', 'accepted', 'declined'],
          default: 'pending'
        },
        invitedAt: {
          type: Date,
          default: Date.now
        },
        expiresAt: Date
      }
    ],
    isPersonal: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', GroupSchema);
