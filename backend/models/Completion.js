const mongoose = require('mongoose');

const CompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    required: true
  },
  actualMinutes: {
    type: Number,
    required: true
  },
  withinRecommended: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

// Ensure one completion per user per problem
CompletionSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('Completion', CompletionSchema);
