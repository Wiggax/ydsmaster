import express from 'express';
import { query } from '../database/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all books (metadata only)
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await query(`
            SELECT id, title, description, topic, cover_color as "coverColor", 
                   cover_icon as "coverIcon", total_pages as "totalPages", 
                   is_pro as "isPro", created_at as "createdAt"
            FROM books
            ORDER BY id
        `);

        res.json(result.rows);
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

        // Get book details
        const bookResult = await query(`
            SELECT id, title, author, content, difficulty, 
                   cover_color as "coverColor", cover_icon as "coverIcon", 
                   total_pages as "totalPages", is_pro as "isPro", 
                   created_at as "createdAt"
            FROM books
            WHERE id = $1
        `, [normalizedBookId]);

        const book = bookResult.rows[0];

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Check if book requires Pro and user has Pro (Book 1 is free for everyone)
        if (book.isPro && book.id !== 1) {
            const userResult = await query('SELECT is_pro FROM users WHERE id = $1', [req.user.id]);
            const user = userResult.rows[0];

            if (!user || !user.is_pro) {
                return res.status(403).json({ error: 'Pro subscription required to access this book' });
            }
        }

        // Parse content pages (assuming content is stored as JSON string of pages or we need to split it)
        // In the migration, we stored content as text. 
        // If the original data had pages, we need to handle that.
        // Let's assume for now we return the book as is.
        // Wait, the frontend expects `book.pages`.
        // If `content` is a JSON string of pages, we parse it.
        // If it's just text, we might need to paginate it on the fly or it was migrated incorrectly.
        // Looking at migrate.js, we inserted `content` directly.
        // Let's try to parse it if it looks like JSON, otherwise wrap it.

        let pages = [];
        try {
            pages = JSON.parse(book.content);
        } catch (e) {
            // If not JSON, maybe it's raw text. Let's create a single page or split it.
            // For now, let's assume it's a single page if not JSON.
            pages = [{ pageNumber: 1, content: book.content }];
        }

        // If pages is not an array (e.g. it was a simple string in JSON), fix it
        if (!Array.isArray(pages)) {
            pages = [{ pageNumber: 1, content: book.content }];
        }

        res.json({ ...book, pages });
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

        // Check existing progress
        const progressResult = await query(`
            SELECT page_number FROM reading_progress 
            WHERE user_id = $1 AND book_id = $2
        `, [req.user.id, normalizedBookId]);

        const existingProgress = progressResult.rows[0];
        let pointsAwarded = 0;
        const previousPage = existingProgress ? existingProgress.page_number : 0;

        // Only award points for NEW pages
        if (pageNumber > previousPage) {
            const newPagesCount = pageNumber - previousPage;
            pointsAwarded = newPagesCount * 10;

            // Add points record (user_progress table)
            await query(`
                INSERT INTO user_progress (user_id, content_type, completed, metadata, created_at)
                VALUES ($1, 'reading_points', true, $2, CURRENT_TIMESTAMP)
            `, [req.user.id, JSON.stringify({
                score: pointsAwarded,
                bookId: normalizedBookId,
                pageNumber: pageNumber,
                pagesRead: newPagesCount
            })]);

            // Update user score (assuming we have a score column or calculate it)
            // For now, just logging the progress is enough as per schema
        }

        if (existingProgress) {
            // Only update if page number is higher
            if (pageNumber > existingProgress.page_number) {
                await query(`
                    UPDATE reading_progress 
                    SET page_number = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = $2 AND book_id = $3
                `, [pageNumber, req.user.id, normalizedBookId]);
            }
        } else {
            await query(`
                INSERT INTO reading_progress (user_id, book_id, page_number)
                VALUES ($1, $2, $3)
            `, [req.user.id, normalizedBookId, pageNumber]);
        }

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

        const result = await query(`
            SELECT page_number as "pageNumber"
            FROM reading_progress
            WHERE user_id = $1 AND book_id = $2
        `, [req.user.id, normalizedBookId]);

        res.json(result.rows[0] || { pageNumber: 1 });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

export default router;
