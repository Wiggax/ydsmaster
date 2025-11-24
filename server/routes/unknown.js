import express from 'express';
import { query } from '../database/db.js';

const router = express.Router();

// Add word to unknown list
router.post('/', async (req, res) => {
    try {
        const { userId, wordId } = req.body;

        if (userId === undefined || wordId === undefined) {
            return res.status(400).json({ error: 'userId and wordId are required' });
        }

        const normalizedUserId = Number(userId);
        // wordId is a string (VARCHAR), so we don't convert it to Number

        if (!Number.isFinite(normalizedUserId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        if (!wordId) {
            return res.status(400).json({ error: 'Invalid wordId' });
        }

        // Try to insert, if already exists, return success message
        try {
            await query(
                'INSERT INTO unknown_words (user_id, word_id, added_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
                [normalizedUserId, wordId]
            );
            res.json({ message: 'Word added to unknown list' });
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(200).json({ message: 'Word already in unknown list' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error adding unknown word:', error);
        res.status(500).json({ error: 'Failed to add word' });
    }
});

// Get user's unknown words
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const normalizedUserId = Number(userId);

        if (!Number.isFinite(normalizedUserId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        const result = await query(`
            SELECT w.id, w.term, w.definition_tr, w.type, w.examples
            FROM unknown_words uw
            JOIN words w ON w.id = uw.word_id
            WHERE uw.user_id = $1
            ORDER BY uw.added_at DESC
        `, [normalizedUserId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching unknown words:', error);
        res.status(500).json({ error: 'Failed to fetch unknown words' });
    }
});

// Remove word from unknown list
router.delete('/:userId/:wordId', async (req, res) => {
    try {
        const { userId, wordId } = req.params;
        const normalizedUserId = Number(userId);
        // wordId is string

        if (!Number.isFinite(normalizedUserId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        const result = await query(
            'DELETE FROM unknown_words WHERE user_id = $1 AND word_id = $2',
            [normalizedUserId, wordId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Word not found in unknown list' });
        }

        res.json({ message: 'Word removed from unknown list' });
    } catch (error) {
        console.error('Error removing unknown word:', error);
        res.status(500).json({ error: 'Failed to remove word' });
    }
});

export default router;
