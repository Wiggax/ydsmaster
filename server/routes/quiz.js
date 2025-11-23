import express from 'express';
import { query } from '../database/db.js';

const router = express.Router();

// Helper function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Generate quiz from user's unknown words
router.post('/generate', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Get user's unknown words with full word details
        const result = await query(`
            SELECT DISTINCT w.id, w.term, w.definition_tr, w.type, w.examples
            FROM unknown_words uw
            JOIN words w ON w.id = uw.word_id
            WHERE uw.user_id = $1
        `, [userId]);

        const fullUnknownWords = result.rows;

        if (fullUnknownWords.length < 10) {
            return res.status(400).json({
                error: 'You need at least 10 unknown words to generate a quiz',
                currentCount: fullUnknownWords.length
            });
        }

        // Determine number of questions (10-20 based on available words)
        const numQuestions = Math.min(20, fullUnknownWords.length);

        // Shuffle and select words for quiz
        const selectedWords = shuffleArray(fullUnknownWords).slice(0, numQuestions);

        // Generate questions - all questions show Turkish meaning with shuffled options from unknown words
        const questions = selectedWords.map((correctWord, index) => {
            // Get wrong options from other unknown words
            const wrongOptions = fullUnknownWords
                .filter(w => w.id !== correctWord.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            // Create shuffled options with Turkish meanings
            const options = shuffleArray([
                { id: correctWord.id, text: correctWord.definition_tr, isCorrect: true },
                ...wrongOptions.map(w => ({ id: w.id, text: w.definition_tr, isCorrect: false }))
            ]);

            return {
                id: index + 1,
                type: 'multiple_choice',
                wordId: correctWord.id,
                question: `"${correctWord.term}" kelimesinin anlamı nedir?`,
                word: correctWord.term,
                options: options,
                correctAnswer: correctWord.id,
                explanation: correctWord.examples || `${correctWord.term} kelimesi ${correctWord.definition_tr} anlamına gelir.`
            };
        });

        // Create quiz object
        const quiz = {
            id: Date.now(),
            userId: userId,
            questions: questions,
            createdAt: new Date().toISOString()
        };

        res.json(quiz);
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// Submit quiz and get results
router.post('/submit', async (req, res) => {
    try {
        const { userId, quizId, answers } = req.body;

        if (!userId || !quizId || !answers) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Calculate score
        let correctCount = 0;
        const results = answers.map(answer => {
            const isCorrect = answer.selectedAnswer === answer.correctAnswer;
            if (isCorrect) correctCount++;

            return {
                questionId: answer.questionId,
                wordId: answer.wordId,
                selectedAnswer: answer.selectedAnswer,
                correctAnswer: answer.correctAnswer,
                isCorrect: isCorrect
            };
        });

        const score = {
            correct: correctCount,
            total: answers.length,
            percentage: Math.round((correctCount / answers.length) * 100)
        };

        // Save quiz result to history
        const result = await query(
            `INSERT INTO quiz_history (user_id, quiz_id, score, results, completed_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             RETURNING id`,
            [userId, quizId, JSON.stringify(score), JSON.stringify(results)]
        );

        res.json({
            success: true,
            score: score,
            results: results,
            resultId: result.rows[0].id
        });
    } catch (error) {
        console.error('Quiz submission error:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// Get quiz history for user
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await query(
            `SELECT id, user_id as "userId", quiz_id as "quizId", score, results, completed_at as "completedAt"
             FROM quiz_history
             WHERE user_id = $1
             ORDER BY completed_at DESC`,
            [parseInt(userId)]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Quiz history error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz history' });
    }
});

// Get specific quiz result
router.get('/result/:resultId', async (req, res) => {
    try {
        const { resultId } = req.params;

        const result = await query(
            `SELECT id, user_id as "userId", quiz_id as "quizId", score, results, completed_at as "completedAt"
             FROM quiz_history
             WHERE id = $1`,
            [parseInt(resultId)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quiz result not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Quiz result error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz result' });
    }
});

export default router;
