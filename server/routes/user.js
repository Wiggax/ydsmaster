import express from 'express';
import { query } from '../database/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get current user's statistics
router.get('/stats', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user info
        const userResult = await query(
            'SELECT last_login FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get unknown words count
        const unknownResult = await query(
            'SELECT COUNT(*) as count FROM unknown_words WHERE user_id = $1',
            [userId]
        );

        // Get progress count
        const progressResult = await query(
            'SELECT COUNT(*) as count FROM user_progress WHERE user_id = $1',
            [userId]
        );

        // Get leaderboard score
        const scoreResult = await query(
            'SELECT score FROM leaderboard WHERE user_id = $1',
            [userId]
        );

        const score = scoreResult.rows[0]?.score || 0;
        const learnedCount = parseInt(unknownResult.rows[0].count) || 0;
        const totalActivities = parseInt(progressResult.rows[0].count) || 0;

        res.json({
            dailyStreak: 1,
            score,
            learnedCount,
            accuracy: totalActivities > 0 ? 75 : 0,
            totalActivities
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
    try {
        const result = await query(`
            SELECT u.id, u.username, u.role, u.created_at, l.score
            FROM users u
            LEFT JOIN leaderboard l ON l.user_id = u.id
            WHERE u.is_deleted = false AND u.role != 'admin'
            ORDER BY l.score DESC NULLS LAST, u.created_at ASC
            LIMIT 50
        `);

        res.json(result.rows.map(row => ({
            id: row.id,
            username: row.username,
            score: row.score || 0,
            role: row.role,
            created_at: row.created_at
        })));
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

export default router;
