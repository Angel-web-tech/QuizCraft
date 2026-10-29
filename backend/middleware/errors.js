function notFound(req, res) {
  res.status(404).json({ success: false, message: 'The requested API route was not found.' });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body exceeds the 100 KB limit.' });
  }
  if (error instanceof SyntaxError && error.status === 400 && Object.hasOwn(error, 'body')) {
    return res.status(400).json({ success: false, message: 'Request body must contain valid JSON.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'A supplied identifier is invalid.' });
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    const message = field === 'registerNumber'
      ? 'That student register number is already in use.'
      : 'An account with that email already exists.';
    return res.status(409).json({ success: false, message });
  }

  console.error(error);
  return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
}

module.exports = { errorHandler, notFound };
