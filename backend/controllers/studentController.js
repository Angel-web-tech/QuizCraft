const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const { pagination, escapeRegex, quizForStudent, publicUser } = require('./shared');
const { attemptResult } = require('./attemptController');

async function dashboard(req, res, next) {
  try {
    const [availableQuizzes, attemptCount, averages, recentAttempts] = await Promise.all([
      Quiz.countDocuments({ status: 'published', isDeleted: false }),
      Attempt.countDocuments({ student: req.user.id, status: 'submitted' }),
      Attempt.aggregate([
        { $match: { student: req.user._id, status: 'submitted' } },
        { $group: { _id: null, average: { $avg: '$percentage' } } },
      ]),
      Attempt.find({ student: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('quiz', 'title category'),
    ]);

    return res.json({
      success: true,
      data: {
        user: publicUser(req.user),
        availableQuizzes,
        completedQuizzes: attemptCount,
        averageScore: averages[0]?.average || 0,
        recentAttempts: recentAttempts.map(attemptResult),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function listQuizzes(req, res, next) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const query = { status: 'published', isDeleted: false };
    if (typeof req.query.category === 'string' && req.query.category.trim()) {
      query.category = req.query.category.trim();
    }
    if (['easy', 'medium', 'hard'].includes(req.query.difficulty)) query.difficulty = req.query.difficulty;
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      query.$or = [{ title: search }, { description: search }, { category: search }];
    }

    const [quizzes, total] = await Promise.all([
      Quiz.find(query).populate('creator', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Quiz.countDocuments(query),
    ]);
    return res.json({
      success: true,
      data: {
        quizzes: quizzes.map(quizForStudent),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, status: 'published', isDeleted: false })
      .populate('creator', 'name');
    if (!quiz) return res.status(404).json({ success: false, message: 'Published quiz not found.' });
    return res.json({ success: true, data: { quiz: quizForStudent(quiz) } });
  } catch (error) {
    return next(error);
  }
}

async function history(req, res, next) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const [attempts, total] = await Promise.all([
      Attempt.find({ student: req.user.id })
        .populate('quiz', 'title category allowReview')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Attempt.countDocuments({ student: req.user.id }),
    ]);
    return res.json({
      success: true,
      data: { attempts: attempts.map(attemptResult), pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    return next(error);
  }
}

function profile(req, res) {
  return res.json({ success: true, data: { user: publicUser(req.user) } });
}

module.exports = { dashboard, listQuizzes, getQuiz, history, profile };
