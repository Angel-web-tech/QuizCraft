const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const verifyToken = require('../middleware/auth');

router.post('/', verifyToken, attemptController.submitAttempt);
router.get('/user', verifyToken, attemptController.getUserAttempts);

module.exports = router;
