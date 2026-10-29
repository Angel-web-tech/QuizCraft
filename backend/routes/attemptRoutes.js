const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/attemptController');

const router = express.Router();
router.use(authenticate, authorize('student'));
router.post('/', controller.begin);
router.get('/:id', controller.getAttempt);
router.post('/:id/submit', controller.submit);

module.exports = router;
