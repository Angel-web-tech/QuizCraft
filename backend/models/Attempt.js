const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    optionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    unansweredCount: { type: Number, default: 0 },
    startedAt: { type: Date, required: true },
    deadline: { type: Date, required: true },
    submittedAt: { type: Date },
    status: { type: String, enum: ['in_progress', 'submitted', 'expired'], default: 'in_progress' },
  },
  { timestamps: true }
);

attemptSchema.index({ student: 1, createdAt: -1 });
attemptSchema.index({ quiz: 1, createdAt: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
