const db = require('../config/db');

// ── Create quiz (all logged-in users) ────────────────────────
exports.createQuiz = async (req, res) => {
    const { title, description, category, time_limit, questions } = req.body;
    const user_id = req.user.id;

    if (!title?.trim())
        return res.status(400).json({ message: 'Quiz title is required' });
    if (!questions || questions.length === 0)
        return res.status(400).json({ message: 'At least one question is required' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [quizResult] = await connection.execute(
            'INSERT INTO quizzes (user_id, title, description, category, time_limit) VALUES (?, ?, ?, ?, ?)',
            [user_id, title, description || '', category || 'General', parseInt(time_limit) || 10]
        );
        const quizId = quizResult.insertId;

        for (const q of questions) {
            const [qResult] = await connection.execute(
                'INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)',
                [quizId, q.question_text]
            );
            for (const opt of q.options) {
                await connection.execute(
                    'INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
                    [qResult.insertId, opt.option_text, opt.is_correct ? 1 : 0]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Quiz created successfully', quizId });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Error creating quiz' });
    } finally {
        connection.release();
    }
};

// ── Get all quizzes (public) ──────────────────────────────────
exports.getAllQuizzes = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const params = [];

        let query = `
            SELECT q.*, u.name AS creator_name,
            (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS question_count
            FROM quizzes q
            JOIN users u ON q.user_id = u.id
            WHERE 1=1
        `;

        if (category) { query += ' AND q.category = ?'; params.push(category); }
        if (search)   { query += ' AND (q.title LIKE ? OR q.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

        query += ' ORDER BY q.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [quizzes] = await db.query(query, params);
        res.json(quizzes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
};

// ── Get single quiz with questions (no correct answers exposed) ──
exports.getQuizById = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT q.*, u.name AS creator_name
            FROM quizzes q JOIN users u ON q.user_id = u.id
            WHERE q.id = ?
        `, [req.params.id]);

        if (!rows.length) return res.status(404).json({ message: 'Quiz not found' });

        const quiz = rows[0];
        const [questions] = await db.execute('SELECT * FROM questions WHERE quiz_id = ?', [quiz.id]);

        for (const q of questions) {
            const [options] = await db.execute(
                'SELECT id, option_text FROM options WHERE question_id = ?', [q.id]
            );
            q.options = options;
        }

        quiz.questions = questions;
        res.json(quiz);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
};

// ── Delete quiz (owner only) ──────────────────────────────────
exports.deleteQuiz = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: 'Quiz not found' });
        if (rows[0].user_id !== req.user.id)
            return res.status(403).json({ message: 'You can only delete your own quizzes' });

        await db.execute('DELETE FROM quizzes WHERE id = ?', [req.params.id]);
        res.json({ message: 'Quiz deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting quiz' });
    }
};

// ── Get quizzes created by logged-in user ─────────────────────
exports.getCreatorQuizzes = async (req, res) => {
    try {
        const [quizzes] = await db.execute(`
            SELECT q.*,
            (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS question_count,
            (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) AS attempt_count
            FROM quizzes q
            WHERE q.user_id = ?
            ORDER BY q.created_at DESC
        `, [req.user.id]);
        res.json(quizzes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching your quizzes' });
    }
};

// ── Get detailed attempt reports for a specific quiz (owner only) ──
exports.getQuizReports = async (req, res) => {
    try {
        const quizId = req.params.id;

        // Verify quiz ownership
        const [rows] = await db.execute('SELECT user_id, title FROM quizzes WHERE id = ?', [quizId]);
        if (!rows.length) return res.status(404).json({ message: 'Quiz not found' });
        if (rows[0].user_id !== req.user.id)
            return res.status(403).json({ message: 'Only the quiz creator can view reports' });

        const [attempts] = await db.execute(`
            SELECT qa.id, qa.score, qa.total_questions, qa.percentage, qa.created_at,
                   u.name AS user_name, u.email AS user_email
            FROM quiz_attempts qa
            JOIN users u ON qa.user_id = u.id
            WHERE qa.quiz_id = ?
            ORDER BY qa.created_at DESC
        `, [quizId]);

        res.json({
            quiz_title: rows[0].title,
            total_attempts: attempts.length,
            avg_score: attempts.length
                ? (attempts.reduce((s, a) => s + parseFloat(a.percentage), 0) / attempts.length).toFixed(1)
                : 0,
            attempts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching reports' });
    }
};
