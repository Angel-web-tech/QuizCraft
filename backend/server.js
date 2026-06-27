const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes    = require('./routes/authRoutes');
const quizRoutes    = require('./routes/quizRoutes');
const attemptRoutes = require('./routes/attemptRoutes');

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/quizzes',  quizRoutes);
app.use('/api/attempts', attemptRoutes);

// ── Health check ───────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', message: 'QuizMaster API running' }));

// ── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
