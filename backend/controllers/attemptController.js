const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const { validId, quizForStudent, pagination } = require('./shared');
const scoreQuiz = require('../services/scoringService');

function attemptResult(attempt) {
  const quiz = attempt.quiz && typeof attempt.quiz === 'object'
    ? { id: String(attempt.quiz._id), title: attempt.quiz.title, category: attempt.quiz.category }
    : null;
  return {
    id: String(attempt._id),
    quiz,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    percentage: attempt.percentage,
    correctCount: attempt.correctCount,
    incorrectCount: attempt.incorrectCount,
    unansweredCount: attempt.unansweredCount,
    status: attempt.status,
    startedAt: attempt.startedAt,
    deadline: attempt.deadline,
    submittedAt: attempt.submittedAt || null,
    createdAt: attempt.createdAt,
  };
}

function resultWithReview(attempt, quiz) {
  const data = attemptResult({ ...attempt.toObject(), quiz });
  data.passed = quiz.passingScore > 0 ? attempt.score >= quiz.passingScore : null;
  if (quiz.allowReview && attempt.status === 'submitted') {
    const answersByQuestion = new Map(
      attempt.answers.map((answer) => [String(answer.questionId), String(answer.optionId)])
    );
    data.review = quiz.questions.map((question) => {
      const selectedOption = answersByQuestion.get(String(question._id)) || null;
      return {
        questionId: String(question._id),
        text: question.text,
        selectedOption,
        correctOption: String(question.correctOption),
        options: question.options.map((option) => ({
          id: String(option._id),
          text: option.text,
        })),
      };
    });
  }
  return data;
}

async function begin(req, res, next) {
  try {
    if (!validId(req.body.quizId)) {
      return res.status(400).json({ success: false, message: 'A valid quiz is required.' });
    }
    const quiz = await Quiz.findOne({ _id: req.body.quizId, status: 'published', isDeleted: false });
    if (!quiz) return res.status(404).json({ success: false, message: 'Published quiz not found.' });
    const startedAt = new Date();
    const attempt = await Attempt.create({
      student: req.user.id,
      quiz: quiz.id,
      totalMarks: quiz.totalMarks,
      startedAt,
      deadline: new Date(startedAt.getTime() + quiz.durationMinutes * 60 * 1000),
    });
    return res.status(201).json({
      success: true,
      data: { attempt: attemptResult({ ...attempt.toObject(), quiz }), quiz: quizForStudent(quiz) },
    });
  } catch (error) {
    return next(error);
  }
}

async function getAttempt(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid attempt ID.' });
    const attempt = await Attempt.findOne({ _id: req.params.id, student: req.user.id }).populate('quiz');
    if (!attempt || !attempt.quiz || attempt.quiz.isDeleted) {
      return res.status(404).json({ success: false, message: 'Attempt not found.' });
    }
    if (attempt.status === 'in_progress' && attempt.deadline <= new Date()) {
      attempt.status = 'expired';
      await attempt.save();
    }
    const data = resultWithReview(attempt, attempt.quiz);
    if (attempt.status === 'in_progress') {
      data.answers = attempt.answers.map((answer) => ({
        questionId: String(answer.questionId),
        optionId: String(answer.optionId),
      }));
      data.quiz = quizForStudent(attempt.quiz);
    }
    return res.json({ success: true, data: { attempt: data } });
  } catch (error) {
    return next(error);
  }
}

async function submit(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid attempt ID.' });
    if (!Array.isArray(req.body.answers)) {
      return res.status(400).json({ success: false, message: 'Answers must be provided as a list.' });
    }
    const attempt = await Attempt.findOne({ _id: req.params.id, student: req.user.id }).populate('quiz');
    if (!attempt || !attempt.quiz) return res.status(404).json({ success: false, message: 'Attempt not found.' });
    if (attempt.status === 'submitted') {
      return res.json({ success: true, data: { attempt: resultWithReview(attempt, attempt.quiz) } });
    }
    if (attempt.status !== 'in_progress' || attempt.deadline <= new Date()) {
      if (attempt.status === 'in_progress') {
        await Attempt.updateOne({ _id: attempt.id, status: 'in_progress' }, { $set: { status: 'expired' } });
      }
      return res.status(410).json({ success: false, message: 'The attempt deadline has passed; this attempt was not scored.' });
    }

    const quiz = attempt.quiz;
    const questionMap = new Map(quiz.questions.map((question) => [String(question._id), question]));
    const normalized = [];
    const seenQuestions = new Set();
    for (const answer of req.body.answers) {
      if (!answer || !validId(answer.questionId) || !validId(answer.optionId)) {
        return res.status(400).json({ success: false, message: 'An answer contains an invalid question or option.' });
      }
      const questionId = String(answer.questionId);
      const optionId = String(answer.optionId);
      const question = questionMap.get(questionId);
      if (!question || seenQuestions.has(questionId) || !question.options.some((option) => String(option._id) === optionId)) {
        return res.status(400).json({ success: false, message: 'An answer does not belong to this quiz.' });
      }
      seenQuestions.add(questionId);
      normalized.push({ questionId, optionId });
    }

    const score = scoreQuiz(quiz, normalized);
    const submittedAt = new Date();
    const update = await Attempt.findOneAndUpdate(
      { _id: attempt.id, student: req.user.id, status: 'in_progress', deadline: { $gt: submittedAt } },
      {
        $set: {
          answers: normalized,
          ...score,
          submittedAt,
          status: 'submitted',
        },
      },
      { new: true }
    );

    if (!update) {
      const current = await Attempt.findById(attempt.id);
      if (current?.status === 'submitted') {
        return res.json({ success: true, data: { attempt: resultWithReview(current, quiz) } });
      }
      await Attempt.updateOne({ _id: attempt.id, status: 'in_progress' }, { $set: { status: 'expired' } });
      return res.status(410).json({ success: false, message: 'The attempt deadline has passed; this attempt was not scored.' });
    }

    return res.json({ success: true, data: { attempt: resultWithReview(update, quiz) } });
  } catch (error) {
    return next(error);
  }
}

async function adminAttempts(req, res, next) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const query = {};
    if (validId(req.query.quizId)) query.quiz = req.query.quizId;
    if (validId(req.query.studentId)) query.student = req.query.studentId;
    if (['submitted', 'expired', 'in_progress'].includes(req.query.status)) query.status = req.query.status;
    const [attempts, total] = await Promise.all([
      Attempt.find(query).populate('student', 'name email registerNumber').populate('quiz', 'title category')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Attempt.countDocuments(query),
    ]);
    return res.json({
      success: true,
      data: { attempts: attempts.map((attempt) => ({ ...attemptResult(attempt), student: attempt.student })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { begin, getAttempt, submit, adminAttempts, attemptResult };
