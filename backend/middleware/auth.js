const jwt = require('jsonwebtoken');
const User = require('../models/User');

const cookieName = 'quizcraft_session';

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function setSessionCookie(res, user) {
  const token = jwt.sign(
    { sub: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '24h', issuer: 'quizcraft-api', audience: 'quizcraft-web' }
  );
  res.cookie(cookieName, token, sessionCookieOptions());
}

async function authenticate(req, res, next) {
  const token = req.cookies?.[cookieName];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Please sign in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'quizcraft-api',
      audience: 'quizcraft-web',
    });
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'This account is unavailable.' });
    }
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
    }
    return next(error);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to access this resource.' });
    }
    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
  setSessionCookie,
  clearSessionCookie: cookieName,
  sessionCookieOptions,
};
