const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  category: {
    type: String,
  },
  points: {
    type: Number,
    required: true
  },
  problemLink: {
    type: String,
    required: true
  },
  testCases: [{
    input: String,
    expectedOutput: String
  }],
  constraints: {
    type: String
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  tags: [String],
  solvedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Problem', ProblemSchema);
