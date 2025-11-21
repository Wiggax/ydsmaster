import express from 'express';
import db from '../db.js';

const router = express.Router();

// Add word to unknown list
router.post('/', async (req, res) => {
    try {
        const { userId, wordId } = req.body;

        if (userId === undefined || wordId === undefined) {
            return res.status(400).json({ error: 'userId and wordId are required' });
        }

        const normalizedUserId = Number(userId);
        const normalizedWordId = String(wordId);

        if (!Number.isFinite(normalizedUserId) || !normalizedWordId) {
            return res.status(400).json({ error: 'Invalid userId or wordId' });
        }

        await db.read();
        db.data.unknown_words ??= [];

        // Check if already exists
        const exists = db.data.unknown_words.find(
            uw => uw.userId === normalizedUserId && String(uw.wordId) === normalizedWordId
        );

        if (exists) {
            return res.status(200).json({ message: 'Word already in unknown list' });
        }

        // Add to unknown words
        db.data.unknown_words.push({
            id: Date.now(),
            userId: normalizedUserId,
            wordId: normalizedWordId,
            addedAt: new Date().toISOString()
        });

        await db.write();
        res.json({ message: 'Word added to unknown list' });
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

        await db.read();
        db.data.unknown_words ??= [];
        db.data.words ??= [];

        // Get user's unknown word IDs
        const unknownWordIds = db.data.unknown_words
            .filter(uw => uw.userId === normalizedUserId)
            .map(uw => String(uw.wordId));

        // Get full word details
        const words = db.data.words.filter(w => unknownWordIds.includes(String(w.id)));

        res.json(words);
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
        const normalizedWordId = String(wordId);

        if (!Number.isFinite(normalizedUserId) || !normalizedWordId) {
            return res.status(400).json({ error: 'Invalid userId or wordId' });
        }

        await db.read();
        db.data.unknown_words ??= [];

        const initialLength = db.data.unknown_words.length;
        db.data.unknown_words = db.data.unknown_words.filter(
            uw => !(uw.userId === normalizedUserId && String(uw.wordId) === normalizedWordId)
        );

        if (db.data.unknown_words.length === initialLength) {
            return res.status(404).json({ error: 'Word not found in unknown list' });
        }

        await db.write();
        res.json({ message: 'Word removed from unknown list' });
    } catch (error) {
        console.error('Error removing unknown word:', error);
        res.status(500).json({ error: 'Failed to remove word' });
    }
});

export default router;
