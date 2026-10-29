const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  { text: { type: String, required: true, trim: true, maxlength: 300 } },
  { timestamps: false }
);

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    options: {
      type: [optionSchema],
      validate: [(options) => options.length >= 2 && options.length <= 8, 'Questions need 2–8 options.'],
    },
    correctOption: { type: mongoose.Schema.Types.ObjectId, required: true },
    marks: { type: Number, required: true, min: 1, max: 1000 },
  },
  { timestamps: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    durationMinutes: { type: Number, required: true, min: 1, max: 240 },
    totalMarks: { type: Number, required: true, min: 1 },
    passingScore: { type: Number, min: 0, default: 0 },
    instructions: { type: String, trim: true, maxlength: 4000, default: '' },
    questions: {
      type: [questionSchema],
      validate: [(questions) => questions.length > 0 && questions.length <= 100, 'A quiz needs 1–100 questions.'],
    },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    allowReview: { type: Boolean, default: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

quizSchema.index({ status: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
