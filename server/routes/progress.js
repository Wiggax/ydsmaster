import express from 'express';
import { query } from '../database/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Save user progress
router.post('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { contentType, contentId, currentIndex, metadata = {} } = req.body;

        if (!contentType || currentIndex === undefined) {
            return res.status(400).json({ error: 'contentType and currentIndex are required' });
        }

        // Check if progress exists
        const existing = await query(
            `SELECT id FROM user_progress 
             WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
            [userId, contentType, contentId || '']
        );

        const progressData = {
            currentIndex,
            metadata
        };

        if (existing.rows.length > 0) {
            // Update existing
            await query(
                `UPDATE user_progress 
                 SET progress = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE user_id = $2 AND content_type = $3 AND content_id = $4`,
                [JSON.stringify(progressData), userId, contentType, contentId || '']
            );
        } else {
            // Create new
            await query(
                `INSERT INTO user_progress (user_id, content_type, content_id, progress, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [userId, contentType, contentId || '', JSON.stringify(progressData)]
            );
        }

        res.json({ message: 'Progress saved', progress: progressData });
    } catch (error) {
        console.error('Error saving progress:', error);
        res.status(500).json({ error: 'Failed to save progress' });
    }
});

// Get user progress
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { contentType, contentId } = req.query;

        let queryText = 'SELECT * FROM user_progress WHERE user_id = $1';
        const params = [userId];

        if (contentType) {
            queryText += ' AND content_type = $2';
            params.push(contentType);
        }

        if (contentId) {
            queryText += ` AND content_id = $${params.length + 1}`;
            params.push(contentId);
        }

        const result = await query(queryText, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Get specific progress (for resuming)
router.get('/:contentType', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { contentType } = req.params;
        const { contentId } = req.query;

        const result = await query(
            `SELECT * FROM user_progress 
             WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
            [userId, contentType, contentId || '']
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Progress not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Delete progress
router.delete('/:contentType', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { contentType } = req.params;
        const { contentId } = req.query;

        const result = await query(
            `DELETE FROM user_progress 
             WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
            [userId, contentType, contentId || '']
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Progress not found' });
        }

        res.json({ message: 'Progress deleted' });
    } catch (error) {
        console.error('Error deleting progress:', error);
        res.status(500).json({ error: 'Failed to delete progress' });
    }
});

export default router;
