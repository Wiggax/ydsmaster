import express from 'express';
import { query } from '../database/db.js';

const router = express.Router();

// Get all words (for word lookup)
router.get('/words/all', async (req, res) => {
    try {
        const result = await query('SELECT * FROM words ORDER BY term');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching all words:', error);
        res.status(500).json({ error: 'Failed to fetch words' });
    }
});

// Get Words by Type
router.get('/words/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const result = await query(
            'SELECT * FROM words WHERE type = $1 ORDER BY term',
            [type]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching words by type:', error);
        res.status(500).json({ error: 'Failed to fetch words' });
    }
});

// Get Texts
router.get('/texts', async (req, res) => {
    try {
        const result = await query('SELECT * FROM texts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching texts:', error);
        res.status(500).json({ error: 'Failed to fetch texts' });
    }
});

export default router;
