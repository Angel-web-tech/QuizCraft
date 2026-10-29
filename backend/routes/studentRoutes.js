const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/studentController');

const router = express.Router();
router.use(authenticate, authorize('student'));
router.get('/dashboard', controller.dashboard);
router.get('/quizzes', controller.listQuizzes);
router.get('/quizzes/:id', controller.getQuiz);
router.get('/attempts', controller.history);
router.get('/profile', controller.profile);

module.exports = router;
