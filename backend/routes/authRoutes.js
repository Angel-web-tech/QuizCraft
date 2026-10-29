const express = require('express');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/authController');

const router = express.Router();
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);

module.exports = router;
