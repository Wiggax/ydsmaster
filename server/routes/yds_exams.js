import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all exams
router.get('/', authenticate, async (req, res) => {
    try {
        db.data.yds_exams ??= [];

        // Return metadata only
        const exams = db.data.yds_exams.map(exam => ({
            id: exam.id,
            title: exam.title,
            description: exam.description,
            questionCount: exam.questions ? exam.questions.length : 0,
            duration: exam.duration || 180 // default 180 mins
        }));

        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// Get specific exam
router.get('/:examId', authenticate, async (req, res) => {
    try {
        const { examId } = req.params;
        const normalizedExamId = Number(examId);

        db.data.yds_exams ??= [];

        const exam = db.data.yds_exams.find(e => e.id === normalizedExamId);

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        res.json(exam);
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ error: 'Failed to fetch exam' });
    }
});

// Submit exam result
router.post('/:examId/submit', authenticate, async (req, res) => {
    try {
        const { examId } = req.params;
        const { answers, score, correctCount, incorrectCount, emptyCount } = req.body;
        const normalizedExamId = Number(examId);

        db.data.exam_results ??= [];

        const result = {
            id: Date.now(),
            userId: req.user.id,
            examId: normalizedExamId,
            answers,
            score,
            correctCount,
            incorrectCount,
            emptyCount,
            completedAt: new Date().toISOString()
        };

        db.data.exam_results.push(result);

        await db.write();

        res.json({ message: 'Exam submitted successfully', result });
    } catch (error) {
        console.error('Error submitting exam:', error);
        res.status(500).json({ error: 'Failed to submit exam' });
    }
});

// Get user's exam results
router.get('/results/me', authenticate, async (req, res) => {
    try {
        db.data.exam_results ??= [];

        const results = db.data.exam_results.filter(r => r.userId === req.user.id);

        res.json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

export default router;
