const test = require('node:test');
const assert = require('node:assert/strict');
const scoreQuiz = require('../services/scoringService');
const { quizInput, quizForStudent, quizForAdmin } = require('../controllers/shared');

test('scores only server-defined correct options and counts unanswered questions', () => {
  const quiz = {
    totalMarks: 6,
    questions: [
      { _id: 'q1', correctOption: 'a1', marks: 2 },
      { _id: 'q2', correctOption: 'b2', marks: 3 },
      { _id: 'q3', correctOption: 'c1', marks: 1 },
    ],
  };

  assert.deepEqual(scoreQuiz(quiz, [
    { questionId: 'q1', optionId: 'a1' },
    { questionId: 'q2', optionId: 'b1' },
  ]), {
    score: 2,
    totalMarks: 6,
    percentage: 33.33,
    correctCount: 1,
    incorrectCount: 1,
    unansweredCount: 1,
  });
});

test('builds quiz options with server-generated IDs and derives total marks', () => {
  const quiz = quizInput({
    title: 'Science',
    category: 'General',
    durationMinutes: 10,
    questions: [{
      text: 'Water formula?',
      marks: 2,
      correctIndex: 0,
      options: ['H2O', 'CO2'],
    }],
  });

  assert.equal(quiz.totalMarks, 2);
  assert.equal(String(quiz.questions[0].correctOption), String(quiz.questions[0].options[0]._id));
});

test('rejects duplicate or invalid answer options', () => {
  assert.throws(() => quizInput({
    title: 'Science',
    category: 'General',
    durationMinutes: 10,
    questions: [{ text: 'Pick one', marks: 1, correctIndex: 0, options: ['Same', ' same '] }],
  }), /unique options/);
});

test('student quiz serialization omits answer keys while admin data maps them to option indexes', () => {
  const quiz = {
    toObject() {
      return {
        _id: 'quiz',
        isDeleted: false,
        questions: [{
          _id: 'q1',
          correctOption: 'o2',
          options: [{ _id: 'o1', text: 'A' }, { _id: 'o2', text: 'B' }],
        }],
      };
    },
  };

  const studentData = quizForStudent(quiz);
  const adminData = quizForAdmin(quiz);
  assert.equal('correctOption' in studentData.questions[0], false);
  assert.equal(adminData.questions[0].correctIndex, 1);
});
