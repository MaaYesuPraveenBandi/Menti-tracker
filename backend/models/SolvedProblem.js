const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SolvedProblemSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    solvedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SolvedProblem', SolvedProblemSchema);
