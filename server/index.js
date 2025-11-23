import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import unknownRoutes from './routes/unknown.js';
import progressRoutes from './routes/progress.js';
import adminRoutes from './routes/admin.js';
import booksRoutes from './routes/books.js';
import ydsExamsRoutes from './routes/yds_exams.js';
import paymentRoutes from './routes/payment.js';
import userRoutes from './routes/user.js';
import accountRoutes from './routes/account.js';
import quizRoutes from './routes/quiz.js';
import migrateRoutes from './routes/migrate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Initialize database
async function initializeDatabase() {
    try {
        await db.read();
        db.data ||= { users: [], words: [], texts: [], unknown_words: [], user_progress: [], leaderboard: [], quiz_history: [] };

        // Initialize arrays if they don't exist
        if (!db.data.users) db.data.users = [];
        if (!db.data.words) db.data.words = [];
        if (!db.data.texts) db.data.texts = [];
        if (!db.data.unknown_words) db.data.unknown_words = [];
        if (!db.data.user_progress) db.data.user_progress = [];
        if (!db.data.leaderboard) db.data.leaderboard = [];
        if (!db.data.quiz_history) db.data.quiz_history = [];
        if (!db.data.reading_progress) db.data.reading_progress = []; // Added from original
        if (!db.data.books) db.data.books = []; // Added from original
        if (!db.data.yds_exams) db.data.yds_exams = []; // Added from original
        if (!db.data.exam_results) db.data.exam_results = []; // Added from original

        await db.write();
        console.log('✓ Database initialized');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Auto-migrate unknown_words field names on startup
async function autoMigrateUnknownWords() {
    try {
        db.data.unknown_words ??= [];

        let migratedCount = 0;
        let alreadyMigratedCount = 0;

        // Check if migration is needed
        const needsMigration = db.data.unknown_words.some(uw => uw.userId !== undefined);

        if (!needsMigration) {
            console.log('✓ Unknown words already migrated');
            return;
        }

        console.log('🔄 Auto-migrating unknown_words field names...');

        // Migrate each unknown word entry
        db.data.unknown_words = db.data.unknown_words.map(uw => {
            // Check if already migrated (has user_id field)
            if (uw.user_id !== undefined) {
                alreadyMigratedCount++;
                return uw;
            }

            // Migrate old format to new format
            const migrated = {
                id: uw.id,
                user_id: uw.userId,
                word_id: uw.wordId,
                added_at: uw.addedAt || new Date().toISOString()
            };

            migratedCount++;
            return migrated;
        });

        await db.write();

        console.log(`✅ Migration complete! Migrated: ${migratedCount}, Already migrated: ${alreadyMigratedCount}, Total: ${db.data.unknown_words.length}`);
    } catch (error) {
        console.error('❌ Auto-migration error:', error);
    }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/user/unknown', unknownRoutes);
app.use('/api/user/progress', progressRoutes);
app.use('/api/user', userRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/yds-exams', ydsExamsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/migrate', migrateRoutes);

app.get('/', (req, res) => {
    res.send('YDS Master Pro API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
initializeDatabase()
    .then(() => autoMigrateUnknownWords())
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
        });
    })
    .catch(error => {
        console.error('Server startup error:', error);
        process.exit(1);
    });

