const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/quizController');
const auth    = require('../middleware/auth');

// Static routes first (before /:id)
router.get('/user/created',      auth, ctrl.getCreatorQuizzes);
router.get('/:id/reports',       auth, ctrl.getQuizReports);

// CRUD
router.get('/',                       ctrl.getAllQuizzes);
router.get('/:id',                    ctrl.getQuizById);
router.post('/',                 auth, ctrl.createQuiz);
router.delete('/:id',            auth, ctrl.deleteQuiz);

module.exports = router;
