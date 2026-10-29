require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDatabase = require('./config/db');
const checkOrigin = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errors');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attemptRoutes = require('./routes/attemptRoutes');

const app = express();
const configuredPort = process.env.PORT ? Number(process.env.PORT) : 5005;
const port = Number.isInteger(configuredPort) && configuredPort > 0 && configuredPort <= 65535
  ? configuredPort
  : null;
const configuredClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
let clientUrl;

try {
  const parsedClientUrl = new URL(configuredClientUrl);
  if (!['http:', 'https:'].includes(parsedClientUrl.protocol)) throw new Error();
  clientUrl = parsedClientUrl.origin;
} catch {
  throw new Error('CLIENT_URL must be a valid HTTP or HTTPS frontend origin.');
}

if (!port) throw new Error('PORT must be an integer from 1 to 65535.');
if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL) {
  throw new Error('CLIENT_URL must be configured for production.');
}
if (process.env.NODE_ENV === 'production' && !clientUrl.startsWith('https://')) {
  throw new Error('CLIENT_URL must use HTTPS in production.');
}

if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET === 'replace_with_a_random_secret_at_least_32_characters'
) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
}

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ success: false, message: 'Request body must be a JSON object.' });
  }
  return next();
});
app.use(cookieParser());
app.use('/api', checkOrigin);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many sign-in attempts. Try again in 15 minutes.' },
});

app.get('/', (req, res) => res.json({ success: true, name: 'QuizCraft API' }));

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attempts', attemptRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`QuizCraft API running at http://localhost:${port}`);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Unable to start QuizCraft API:', error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
