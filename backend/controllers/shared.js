const mongoose = require('mongoose');

function publicUser(user) {
  return {
    id: user.id || String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    registerNumber: user.registerNumber || null,
    department: user.department || null,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 12));
  return { page, limit, skip: (page - 1) * limit };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validId(value) {
  return mongoose.isValidObjectId(value);
}

function quizForStudent(quiz) {
  const object = quiz.toObject ? quiz.toObject() : quiz;
  delete object.isDeleted;
  object.questions = object.questions.map(({ correctOption, ...question }) => question);
  return object;
}

function quizForAdmin(quiz) {
  const object = quiz.toObject ? quiz.toObject() : quiz;
  delete object.isDeleted;
  object.questions = object.questions.map((question) => ({
    ...question,
    correctIndex: question.options.findIndex(
      (option) => String(option._id) === String(question.correctOption)
    ),
  }));
  return object;
}

function quizInput(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const questions = Array.isArray(body.questions) ? body.questions : [];
  if (!title || !category || !questions.length) {
    const error = new Error('Title, category, and at least one question are required.');
    error.status = 400;
    throw error;
  }

  const difficulty = ['easy', 'medium', 'hard'].includes(body.difficulty) ? body.difficulty : 'medium';
  const durationMinutes = Number(body.durationMinutes);
  const passingScore = body.passingScore === '' || body.passingScore == null ? 0 : Number(body.passingScore);
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 240) {
    const error = new Error('Duration must be between 1 and 240 minutes.');
    error.status = 400;
    throw error;
  }
  if (!Number.isFinite(passingScore) || passingScore < 0) {
    const error = new Error('Passing score must be zero or greater.');
    error.status = 400;
    throw error;
  }

  let totalMarks = 0;
  const normalizedQuestions = questions.map((question) => {
    const text = typeof question.text === 'string' ? question.text.trim() : '';
    const options = Array.isArray(question.options)
      ? question.options.map((option) => String(option).trim())
      : [];
    const uniqueOptions = new Set(options.map((option) => option.toLowerCase()));
    const correctIndex = Number(question.correctIndex);
    const marks = Number(question.marks);
    if (
      !text ||
      options.length < 2 ||
      options.length > 8 ||
      options.some((option) => !option) ||
      uniqueOptions.size !== options.length ||
      !Number.isInteger(correctIndex) ||
      correctIndex < 0 ||
      correctIndex >= options.length ||
      !Number.isInteger(marks) ||
      marks < 1 ||
      marks > 1000
    ) {
      const error = new Error('Each question needs text, 2–8 unique options, a correct option, and positive marks.');
      error.status = 400;
      throw error;
    }

    totalMarks += marks;
    const optionDocs = options.map((option) => ({ _id: new mongoose.Types.ObjectId(), text: option }));
    return {
      text,
      options: optionDocs,
      correctOptionIndex: correctIndex,
      marks,
    };
  });

  return {
    title,
    category,
    difficulty,
    durationMinutes,
    passingScore,
    totalMarks,
    description: typeof body.description === 'string' ? body.description.trim() : '',
    instructions: typeof body.instructions === 'string' ? body.instructions.trim() : '',
    allowReview: body.allowReview !== false,
    status: body.status === 'published' ? 'published' : 'draft',
    questions: normalizedQuestions.map(({ correctOptionIndex, ...question }) => ({
      ...question,
      correctOption: question.options[correctOptionIndex]._id,
    })),
  };
}

module.exports = { publicUser, pagination, escapeRegex, validId, quizForStudent, quizForAdmin, quizInput };
