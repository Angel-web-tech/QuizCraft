const db = require('../config/db');

exports.submitAttempt = async (req, res) => {
    const { quiz_id, answers } = req.body;
    const user_id = req.user.id;

    try {
        const [questions] = await db.execute(
            'SELECT id, question_text FROM questions WHERE quiz_id = ?', [quiz_id]
        );
        if (!questions.length)
            return res.status(400).json({ message: 'Quiz has no questions' });

        let score = 0;
        const total_questions = questions.length;
        const results = [];

        for (const q of questions) {
            const [correct] = await db.execute(
                'SELECT id, option_text FROM options WHERE question_id = ? AND is_correct = 1', [q.id]
            );
            if (!correct.length) continue;

            const [allOptions] = await db.execute(
                'SELECT id, option_text FROM options WHERE question_id = ?', [q.id]
            );

            const correctOption   = correct[0];
            const userSelectedId  = answers?.[q.id];
            // eslint-disable-next-line eqeqeq
            const isCorrect = userSelectedId != null && userSelectedId == correctOption.id;
            if (isCorrect) score++;

            // Find user's selected option text
            const selectedOption = allOptions.find(o => o.id == userSelectedId);

            results.push({
                question_id:         q.id,
                question_text:       q.question_text,
                all_options:         allOptions,
                user_selected_id:    userSelectedId  || null,
                user_selected_text:  selectedOption?.option_text || 'Not answered',
                correct_option_id:   correctOption.id,
                correct_option_text: correctOption.option_text,
                is_correct:          isCorrect,
            });
        }

        const percentage = parseFloat(((score / total_questions) * 100).toFixed(2));

        const [insertResult] = await db.execute(
            'INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, percentage) VALUES (?, ?, ?, ?, ?)',
            [user_id, quiz_id, score, total_questions, percentage]
        );

        res.status(201).json({
            attempt_id:      insertResult.insertId,
            quiz_id,
            score,
            total_questions,
            percentage,
            results,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error submitting attempt' });
    }
};

exports.getUserAttempts = async (req, res) => {
    try {
        const [attempts] = await db.execute(`
            SELECT qa.*, q.title AS quiz_title, q.category
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            WHERE qa.user_id = ?
            ORDER BY qa.created_at DESC
        `, [req.user.id]);
        res.json(attempts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching attempts' });
    }
};
