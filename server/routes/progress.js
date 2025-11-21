import express from 'express';
import db from '../db.js';
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

        await db.read();
        db.data.user_progress ??= [];

        // Find existing progress
        const existingIndex = db.data.user_progress.findIndex(
            p => p.userId === userId && p.contentType === contentType && 
                 (contentId ? p.contentId === contentId : true)
        );

        const progressData = {
            userId,
            contentType,
            contentId: contentId || null,
            currentIndex,
            metadata,
            updatedAt: new Date().toISOString()
        };

        if (existingIndex !== -1) {
            // Update existing
            db.data.user_progress[existingIndex] = {
                ...db.data.user_progress[existingIndex],
                ...progressData
            };
        } else {
            // Create new
            progressData.id = Date.now();
            progressData.createdAt = new Date().toISOString();
            db.data.user_progress.push(progressData);
        }

        await db.write();
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

        await db.read();
        db.data.user_progress ??= [];

        let progress = db.data.user_progress.filter(p => p.userId === userId);

        if (contentType) {
            progress = progress.filter(p => p.contentType === contentType);
        }

        if (contentId) {
            progress = progress.filter(p => p.contentId === contentId);
        }

        res.json(progress);
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

        await db.read();
        db.data.user_progress ??= [];

        const progress = db.data.user_progress.find(
            p => p.userId === userId && 
                 p.contentType === contentType &&
                 (contentId ? p.contentId === contentId : !p.contentId)
        );

        if (!progress) {
            return res.status(404).json({ error: 'Progress not found' });
        }

        res.json(progress);
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

        await db.read();
        db.data.user_progress ??= [];

        const initialLength = db.data.user_progress.length;
        db.data.user_progress = db.data.user_progress.filter(
            p => !(p.userId === userId && 
                  p.contentType === contentType &&
                  (contentId ? p.contentId === contentId : !p.contentId))
        );

        if (db.data.user_progress.length === initialLength) {
            return res.status(404).json({ error: 'Progress not found' });
        }

        await db.write();
        res.json({ message: 'Progress deleted' });
    } catch (error) {
        console.error('Error deleting progress:', error);
        res.status(500).json({ error: 'Failed to delete progress' });
    }
});

export default router;

