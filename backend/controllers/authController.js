const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { publicUser } = require('./shared');
const { setSessionCookie, clearSessionCookie, sessionCookieOptions } = require('../middleware/auth');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res, next) {
  try {
    const { name, email, registerNumber, department, password } = req.body;
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !emailPattern.test(email.trim()) ||
      typeof registerNumber !== 'string' ||
      !registerNumber.trim() ||
      typeof department !== 'string' ||
      !department.trim() ||
      typeof password !== 'string' ||
      password.length < 10 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: 'Enter your name, valid email, register number, department, and a password of at least 10 characters.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      registerNumber: registerNumber.trim().toUpperCase(),
      department: department.trim(),
      passwordHash: await bcrypt.hash(password, 12),
      role: 'student',
    });
    return res.status(201).json({ success: true, data: { user: publicUser(user) } });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const requestedRole = req.body.role;
    if (!emailPattern.test(email) || !password || !['student', 'admin'].includes(requestedRole)) {
      return res.status(400).json({ success: false, message: 'Enter valid credentials and choose Student or Admin login.' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !passwordMatches || user.role !== requestedRole || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Email, password, or selected account type is incorrect.' });
    }

    setSessionCookie(res, user);
    return res.json({ success: true, data: { user: publicUser(user) } });
  } catch (error) {
    return next(error);
  }
}

function logout(req, res) {
  res.clearCookie(clearSessionCookie, { ...sessionCookieOptions(), maxAge: undefined });
  return res.json({ success: true, data: { message: 'You have been signed out.' } });
}

function me(req, res) {
  return res.json({ success: true, data: { user: publicUser(req.user) } });
}

module.exports = { register, login, logout, me };
