const mongoose = require('mongoose');
const crypto = require('crypto');

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed'],
      default: 'planning',
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    inviteCode: { type: String, unique: true, index: true },
    deadline: { type: Date },
  },
  { timestamps: true }
);

ProjectSchema.pre('validate', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  if (this.owner && !this.members.some((member) => member.toString() === this.owner.toString())) {
    this.members.unshift(this.owner);
  }
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
