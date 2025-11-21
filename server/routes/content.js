import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all words (for word lookup)
router.get('/words/all', async (req, res) => {
    await db.read();
    res.json(db.data.words || []);
});

// Get Words by Type
router.get('/words/:type', async (req, res) => {
    const { type } = req.params;
    await db.read();
    const words = db.data.words.filter(w => w.type === type);
    res.json(words);
});

// Get Texts
router.get('/texts', async (req, res) => {
    await db.read();
    res.json(db.data.texts);
});

// Seed Data (For development)
router.post('/seed', async (req, res) => {
    await db.read();
    if (db.data.words.length > 0) {
        return res.json({ message: 'Data already seeded' });
    }

    const verbs = [
        { term: 'administer', type: 'verb', definition_tr: 'yönetmek, idare etmek', synonyms: 'manage, direct', examples: 'The doctor administered the medication.' },
        { term: 'advocate', type: 'verb', definition_tr: 'savunmak, desteklemek', synonyms: 'support, recommend', examples: 'He advocates for human rights.' },
        { term: 'alleviate', type: 'verb', definition_tr: 'hafifletmek, azaltmak', synonyms: 'ease, relieve', examples: 'The medicine alleviated her pain.' }
    ];

    const adjs = [
        { term: 'abundant', type: 'adjective', definition_tr: 'bol, bereketli', synonyms: 'plentiful, ample', examples: 'We have abundant resources.' },
        { term: 'coherent', type: 'adjective', definition_tr: 'tutarlı, mantıklı', synonyms: 'logical, consistent', examples: 'The argument was coherent.' }
    ];

    const nouns = [
        { term: 'access', type: 'noun', definition_tr: 'erişim, giriş', synonyms: 'entry, admission', examples: 'Access to the building is restricted.' },
        { term: 'benefit', type: 'noun', definition_tr: 'fayda, yarar', synonyms: 'advantage, profit', examples: 'The benefits of exercise are clear.' }
    ];

    // Add IDs
    let idCounter = 1;
    const allWords = [...verbs, ...adjs, ...nouns].map(w => ({ ...w, id: idCounter++ }));

    await db.update(({ words }) => words.push(...allWords));
    res.json({ message: 'Seeding complete' });
});

export default router;
