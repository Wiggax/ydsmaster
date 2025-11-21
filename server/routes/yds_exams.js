import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all YDS exams (metadata only)
router.get('/', authenticate, async (req, res) => {
    try {
        await db.read();
        db.data.yds_exams ??= [];

        // Return only metadata
        const examsMetadata = db.data.yds_exams.map(exam => ({
            id: exam.id,
            title: exam.title,
            duration: exam.duration,
            totalQuestions: exam.totalQuestions,
            isPro: exam.id !== 1 // Exam 1 is free, others require Pro
        }));

        res.json(examsMetadata);
    } catch (error) {
        console.error('Error fetching YDS exams:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// Get specific exam with all questions
router.get('/:examId', authenticate, async (req, res) => {
    try {
        const { examId } = req.params;
        const normalizedExamId = Number(examId);

        await db.read();
        db.data.yds_exams ??= [];

        const exam = db.data.yds_exams.find(e => e.id === normalizedExamId);

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Check if exam requires Pro (Exam 1 is free for everyone)
        if (normalizedExamId !== 1) {
            db.data.users ??= [];
            const user = db.data.users.find(u => u.id === req.user.id);
            if (!user || !user.isPro) {
                return res.status(403).json({ error: 'Pro subscription required to access this exam' });
            }
        }

        res.json(exam);
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ error: 'Failed to fetch exam' });
    }
});

// Save exam result
router.post('/:examId/result', authenticate, async (req, res) => {
    try {
        const { examId } = req.params;
        const { answers, score, timeSpent } = req.body;
        const normalizedExamId = Number(examId);

        await db.read();
        db.data.exam_results ??= [];

        const result = {
            id: Date.now(),
            userId: req.user.id,
            examId: normalizedExamId,
            answers,
            score,
            timeSpent,
            completedAt: new Date().toISOString()
        };

        db.data.exam_results.push(result);
        await db.write();

        res.json({ message: 'Result saved', result });
    } catch (error) {
        console.error('Error saving result:', error);
        res.status(500).json({ error: 'Failed to save result' });
    }
});

// Get user's exam results
router.get('/results/my', authenticate, async (req, res) => {
    try {
        await db.read();
        db.data.exam_results ??= [];

        const userResults = db.data.exam_results.filter(r => r.userId === req.user.id);
        res.json(userResults);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

export default router;
