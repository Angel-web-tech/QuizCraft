const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const {
  pagination, escapeRegex, validId, quizForAdmin, quizInput, publicUser,
} = require('./shared');
const { attemptResult } = require('./attemptController');

async function dashboard(req, res, next) {
  try {
    const [students, totalQuizzes, publishedQuizzes, draftQuizzes, attempts, scoreSummary, recentActivity] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        Quiz.countDocuments({ isDeleted: false }),
        Quiz.countDocuments({ isDeleted: false, status: 'published' }),
        Quiz.countDocuments({ isDeleted: false, status: 'draft' }),
        Attempt.countDocuments(),
        Attempt.aggregate([
          { $match: { status: 'submitted' } },
          { $group: { _id: null, average: { $avg: '$percentage' } } },
        ]),
        Attempt.find().sort({ createdAt: -1 }).limit(8)
          .populate('student', 'name email').populate('quiz', 'title'),
      ]);

    return res.json({
      success: true,
      data: {
        stats: {
          students,
          totalQuizzes,
          publishedQuizzes,
          draftQuizzes,
          attempts,
          averageScore: scoreSummary[0]?.average || 0,
        },
        recentActivity: recentActivity.map((attempt) => ({
          ...attemptResult(attempt),
          student: attempt.student ? { name: attempt.student.name, email: attempt.student.email } : null,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function listStudents(req, res, next) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const query = { role: 'student' };
    if (typeof req.query.department === 'string' && req.query.department.trim()) {
      query.department = req.query.department.trim();
    }
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      query.$or = [{ name: search }, { email: search }, { registerNumber: search }];
    }
    const [students, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);
    return res.json({
      success: true,
      data: { students: students.map(publicUser), pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    return next(error);
  }
}

async function getStudent(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid student ID.' });
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    const [attempts, count] = await Promise.all([
      Attempt.find({ student: student.id }).populate('quiz', 'title category')
        .sort({ createdAt: -1 }).limit(20),
      Attempt.countDocuments({ student: student.id }),
    ]);
    return res.json({
      success: true,
      data: { student: publicUser(student), attempts: attempts.map(attemptResult), totalAttempts: count },
    });
  } catch (error) {
    return next(error);
  }
}

async function setStudentStatus(req, res, next) {
  try {
    if (!validId(req.params.id) || typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'A valid student ID and boolean isActive value are required.' });
    }
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      { $set: { isActive: req.body.isActive } },
      { new: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.json({ success: true, data: { user: publicUser(student) } });
  } catch (error) {
    return next(error);
  }
}

async function listQuizzes(req, res, next) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const query = { isDeleted: false };
    if (['draft', 'published'].includes(req.query.status)) query.status = req.query.status;
    if (typeof req.query.category === 'string' && req.query.category.trim()) query.category = req.query.category.trim();
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      query.title = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    }
    const [quizzes, total] = await Promise.all([
      Quiz.find(query).populate('creator', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Quiz.countDocuments(query),
    ]);
    return res.json({
      success: true,
      data: { quizzes: quizzes.map(quizForAdmin), pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    return next(error);
  }
}

async function getQuiz(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid quiz ID.' });
    const quiz = await Quiz.findOne({ _id: req.params.id, isDeleted: false }).populate('creator', 'name');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
    return res.json({ success: true, data: { quiz: quizForAdmin(quiz) } });
  } catch (error) {
    return next(error);
  }
}

async function saveQuiz(req, res, next) {
  try {
    const input = quizInput(req.body);
    if (input.passingScore > input.totalMarks) {
      return res.status(400).json({ success: false, message: 'Passing score cannot exceed the quiz total marks.' });
    }
    const quiz = await Quiz.create({ ...input, creator: req.user.id });
    return res.status(201).json({ success: true, data: { quiz: quizForAdmin(quiz) } });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    return next(error);
  }
}

async function updateQuiz(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid quiz ID.' });
    const input = quizInput(req.body);
    if (input.passingScore > input.totalMarks) {
      return res.status(400).json({ success: false, message: 'Passing score cannot exceed the quiz total marks.' });
    }
    const quiz = await Quiz.findOne({ _id: req.params.id, isDeleted: false });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
    quiz.set(input);
    await quiz.save();
    return res.json({ success: true, data: { quiz: quizForAdmin(quiz) } });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    return next(error);
  }
}

async function deleteQuiz(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid quiz ID.' });
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: { isDeleted: true, status: 'draft' } }
    );
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
    return res.json({ success: true, data: { message: 'Quiz archived. Existing attempts remain available in reports.' } });
  } catch (error) {
    return next(error);
  }
}

async function setQuizStatus(req, res, next) {
  try {
    if (!validId(req.params.id) || !['draft', 'published'].includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Choose a valid quiz status.' });
    }
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: { status: req.body.status } },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
    return res.json({ success: true, data: { quiz: quizForAdmin(quiz) } });
  } catch (error) {
    return next(error);
  }
}

async function reports(req, res, next) {
  try {
    const [summary, quizStats] = await Promise.all([
      Attempt.aggregate([
        { $match: { status: 'submitted' } },
        { $group: { _id: null, count: { $sum: 1 }, averagePercentage: { $avg: '$percentage' } } },
      ]),
      Attempt.aggregate([
        { $match: { status: 'submitted' } },
        { $group: { _id: '$quiz', attempts: { $sum: 1 }, averagePercentage: { $avg: '$percentage' } } },
        { $sort: { attempts: -1 } },
        { $limit: 100 },
        { $lookup: { from: 'quizzes', localField: '_id', foreignField: '_id', as: 'quiz' } },
        { $unwind: { path: '$quiz', preserveNullAndEmptyArrays: true } },
        { $project: { title: '$quiz.title', category: '$quiz.category', attempts: 1, averagePercentage: 1 } },
      ]),
    ]);
    return res.json({
      success: true,
      data: { totalSubmitted: summary[0]?.count || 0, averagePercentage: summary[0]?.averagePercentage || 0, quizzes: quizStats },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  dashboard, listStudents, getStudent, setStudentStatus, listQuizzes, getQuiz,
  saveQuiz, updateQuiz, deleteQuiz, setQuizStatus, reports,
};
