import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all words (for word lookup)
router.get('/words/all', async (req, res) => {
    res.json(db.data.words || []);
});

// Get Words by Type
router.get('/words/:type', async (req, res) => {
    const { type } = req.params;
    const words = db.data.words.filter(w => w.type === type);
    res.json(words);
});

// Get Texts
router.get('/texts', async (req, res) => {
    res.json(db.data.texts);
});

// Seed route removed

export default router;
