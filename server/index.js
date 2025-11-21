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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database with default structure
app.use(async (req, res, next) => {
    try {
        await db.read();
        // Ensure all required fields exist
        if (!db.data.unknown_words) db.data.unknown_words = [];
        if (!db.data.user_progress) db.data.user_progress = [];
        if (!db.data.reading_progress) db.data.reading_progress = [];
        if (!db.data.books) db.data.books = [];
        if (!db.data.yds_exams) db.data.yds_exams = [];
        if (!db.data.exam_results) db.data.exam_results = [];
        await db.write();
    } catch (error) {
        console.error('Database initialization error:', error);
    }
    next();
});

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

app.get('/', (req, res) => {
    res.send('YDS Master Pro API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
