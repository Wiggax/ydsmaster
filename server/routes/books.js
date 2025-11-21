import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all books (metadata only)
router.get('/', authenticate, async (req, res) => {
    try {
        await db.read();
        db.data.books ??= [];

        // Return only metadata, not full pages
        const booksMetadata = db.data.books.map(book => ({
            id: book.id,
            title: book.title,
            description: book.description,
            topic: book.topic,
            totalPages: book.totalPages,
            isPro: book.isPro,
            createdAt: book.createdAt
        }));

        res.json(booksMetadata);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Get specific book with all pages
router.get('/:bookId', authenticate, async (req, res) => {
    try {
        const { bookId } = req.params;
        const normalizedBookId = Number(bookId);

        await db.read();
        db.data.books ??= [];
        db.data.users ??= [];

        const book = db.data.books.find(b => b.id === normalizedBookId);

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Check if book requires Pro and user has Pro (Book 1 is free for everyone)
        if (book.isPro && book.id !== 1) {
            const user = db.data.users.find(u => u.id === req.user.id);
            if (!user || !user.isPro) {
                return res.status(403).json({ error: 'Pro subscription required to access this book' });
            }
        }

        res.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

// Save reading progress
router.post('/:bookId/progress', authenticate, async (req, res) => {
    try {
        const { bookId } = req.params;
        const { pageNumber } = req.body;
        const normalizedBookId = Number(bookId);

        if (!Number.isFinite(pageNumber) || pageNumber < 1) {
            return res.status(400).json({ error: 'Invalid page number' });
        }

        await db.read();
        db.data.reading_progress ??= [];
        db.data.user_progress ??= [];

        // Find existing progress
        const existingProgress = db.data.reading_progress.find(
            p => p.userId === req.user.id && p.bookId === normalizedBookId
        );

        let pointsAwarded = 0;
        const previousPage = existingProgress ? existingProgress.pageNumber : 0;

        // Only award points for NEW pages
        if (pageNumber > previousPage) {
            const newPagesCount = pageNumber - previousPage;
            pointsAwarded = newPagesCount * 10;

            // Add points record
            db.data.user_progress.push({
                id: Date.now(),
                userId: req.user.id,
                contentType: 'reading_points',
                completed: true,
                metadata: {
                    score: pointsAwarded,
                    bookId: normalizedBookId,
                    pageNumber: pageNumber,
                    pagesRead: newPagesCount
                },
                timestamp: new Date().toISOString()
            });
        }

        if (existingProgress) {
            // Only update if page number is higher (keep max progress)
            if (pageNumber > existingProgress.pageNumber) {
                existingProgress.pageNumber = pageNumber;
                existingProgress.updatedAt = new Date().toISOString();
            }
        } else {
            db.data.reading_progress.push({
                id: Date.now(),
                userId: req.user.id,
                bookId: normalizedBookId,
                pageNumber,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        await db.write();
        res.json({ message: 'Progress saved', pageNumber, pointsAwarded });
    } catch (error) {
        console.error('Error saving progress:', error);
        res.status(500).json({ error: 'Failed to save progress' });
    }
});

// Get reading progress for a book
router.get('/:bookId/progress', authenticate, async (req, res) => {
    try {
        const { bookId } = req.params;
        const normalizedBookId = Number(bookId);

        await db.read();
        db.data.reading_progress ??= [];

        const progress = db.data.reading_progress.find(
            p => p.userId === req.user.id && p.bookId === normalizedBookId
        );

        res.json(progress || { pageNumber: 1 });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

export default router;
