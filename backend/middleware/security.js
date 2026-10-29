function checkOrigin(req, res, next) {
  const origin = req.get('origin');
  const allowedOrigin = new URL(process.env.CLIENT_URL || 'http://localhost:5173').origin;
  if (origin && origin !== allowedOrigin) {
    return res.status(403).json({ success: false, message: 'Request origin is not allowed.' });
  }
  return next();
}

module.exports = checkOrigin;
