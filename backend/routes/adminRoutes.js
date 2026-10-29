const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/adminController');
const attempts = require('../controllers/attemptController');

const router = express.Router();
router.use(authenticate, authorize('admin'));
router.get('/dashboard', controller.dashboard);
router.get('/students', controller.listStudents);
router.get('/students/:id', controller.getStudent);
router.patch('/students/:id/status', controller.setStudentStatus);
router.get('/quizzes', controller.listQuizzes);
router.post('/quizzes', controller.saveQuiz);
router.get('/quizzes/:id', controller.getQuiz);
router.put('/quizzes/:id', controller.updateQuiz);
router.delete('/quizzes/:id', controller.deleteQuiz);
router.patch('/quizzes/:id/status', controller.setQuizStatus);
router.get('/attempts', attempts.adminAttempts);
router.get('/reports', controller.reports);

module.exports = router;
