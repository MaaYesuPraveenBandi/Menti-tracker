const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  scope: {
    type: String,
    enum: ['site', 'problem'],
    required: true,
    index: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  },
  startedAt: {
    type: Date,
    required: true
  },
  endedAt: {
    type: Date
  },
  durationMinutes: {
    type: Number,
    default: 0
  },
  idleCuts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', SessionSchema);
