import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../database/db.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorizeAdmin);

// Get all users with stats
router.get('/users', async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                u.id, u.username, u.email, u.phone, u.role, u.is_pro, 
                u.is_deleted, u.deleted_at, u.created_at, u.last_login, u.security_question,
                COUNT(DISTINCT uw.id) as unknown_words_count,
                COUNT(DISTINCT up.id) as progress_count,
                MAX(up.updated_at) as last_activity
            FROM users u
            LEFT JOIN unknown_words uw ON uw.user_id = u.id
            LEFT JOIN user_progress up ON up.user_id = u.id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);

        const users = result.rows.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role || 'user',
            isPro: !!user.is_pro,
            isDeleted: !!user.is_deleted,
            deletedAt: user.deleted_at,
            createdAt: user.created_at,
            lastLogin: user.last_login,
            securityQuestion: user.security_question,
            stats: {
                unknownWordsCount: parseInt(user.unknown_words_count) || 0,
                progressCount: parseInt(user.progress_count) || 0,
                lastActivity: user.last_activity
            }
        }));

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID with detailed stats
router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const normalizedUserId = Number(userId);

        if (!Number.isFinite(normalizedUserId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        const userResult = await query(
            'SELECT id, username, email, phone, role, is_pro, created_at, last_login FROM users WHERE id = $1',
            [normalizedUserId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        // Get unknown words with details
        const unknownWordsResult = await query(`
            SELECT uw.id, uw.word_id, uw.added_at, w.term, w.definition_tr, w.type
            FROM unknown_words uw
            JOIN words w ON w.id = uw.word_id
            WHERE uw.user_id = $1
        `, [normalizedUserId]);

        // Get progress
        const progressResult = await query(
            'SELECT * FROM user_progress WHERE user_id = $1',
            [normalizedUserId]
        );

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role || 'user',
            isPro: !!user.is_pro,
            createdAt: user.created_at,
            lastLogin: user.last_login,
            stats: {
                unknownWordsCount: unknownWordsResult.rows.length,
                unknownWords: unknownWordsResult.rows,
                progressCount: progressResult.rows.length,
                progress: progressResult.rows
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const normalizedUserId = Number(userId);

        if (!Number.isFinite(normalizedUserId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        // Prevent deleting yourself
        if (normalizedUserId === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const userResult = await query(
            'SELECT username FROM users WHERE id = $1',
            [normalizedUserId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userToDelete = userResult.rows[0];
        console.log(`[ADMIN DELETE] Starting deletion of user: ${userToDelete.username} (ID: ${normalizedUserId})`);

        // PostgreSQL will automatically delete related records due to CASCADE
        const deleteResult = await query(
            'DELETE FROM users WHERE id = $1',
            [normalizedUserId]
        );

        console.log(`[ADMIN DELETE] User ${normalizedUserId} permanently deleted from database.`);

        res.json({
            message: 'User deleted successfully',
            deletedUser: userToDelete.username
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Create new user (Admin only)
router.post('/users', async (req, res) => {
    try {
        const { username, email, password, phone, isPro } = req.body;

        if (!username || !email || !password || !phone) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email or phone already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 OR phone = $2',
            [email, phone]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email or phone already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await query(
            `INSERT INTO users (username, email, password_hash, phone, role, is_pro, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
             RETURNING id, username, email, phone, is_pro`,
            [username, email, hashedPassword, phone, 'user', !!isPro]
        );

        const newUser = result.rows[0];

        // Initialize leaderboard entry
        await query(
            'INSERT INTO leaderboard (user_id, score, rank) VALUES ($1, $2, $3)',
            [newUser.id, 0, 0]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                isPro: newUser.is_pro
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Toggle Pro Status
router.patch('/users/:userId/toggle-pro', async (req, res) => {
    try {
        const { userId } = req.params;
        const normalizedUserId = Number(userId);

        if (!Number.isFinite(normalizedUserId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        const result = await query(
            'UPDATE users SET is_pro = NOT is_pro WHERE id = $1 RETURNING is_pro',
            [normalizedUserId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: `User Pro status updated to ${result.rows[0].is_pro}`,
            isPro: result.rows[0].is_pro
        });
    } catch (error) {
        console.error('[Toggle Pro] Error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Update User Role
router.patch('/users/:userId/role', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const normalizedUserId = Number(userId);

        if (!Number.isFinite(normalizedUserId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
        }

        // Prevent changing own role
        if (normalizedUserId === req.user.id) {
            return res.status(400).json({ error: 'Cannot change your own role' });
        }

        const result = await query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING role',
            [role, normalizedUserId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: `User role updated to ${role}`,
            role: result.rows[0].role
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// Reset user password (Admin only)
router.post('/users/:userId/reset-password', async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;
        const normalizedUserId = Number(userId);

        if (!Number.isFinite(normalizedUserId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await query(
            'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
            [hashedPassword, normalizedUserId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Password reset successfully',
            newPassword: newPassword
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Get system stats
router.get('/stats', async (req, res) => {
    try {
        const statsResult = await query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as users_count,
                (SELECT COUNT(*) FROM words) as words_count,
                (SELECT COUNT(*) FROM texts) as texts_count,
                (SELECT COUNT(*) FROM unknown_words) as unknown_words_count,
                (SELECT COUNT(*) FROM user_progress) as progress_count,
                (SELECT COUNT(*) FROM words WHERE type = 'verb') as verbs_count,
                (SELECT COUNT(*) FROM words WHERE type = 'adjective') as adjectives_count,
                (SELECT COUNT(*) FROM words WHERE type = 'noun') as nouns_count,
                (SELECT COUNT(DISTINCT user_id) FROM unknown_words) as active_users_count
        `);

        const recentActivity = await query(`
            SELECT user_id, content_type, updated_at
            FROM user_progress
            ORDER BY updated_at DESC
            LIMIT 10
        `);

        const stats = statsResult.rows[0];

        res.json({
            users: parseInt(stats.users_count),
            words: parseInt(stats.words_count),
            texts: parseInt(stats.texts_count),
            totalUnknownWords: parseInt(stats.unknown_words_count),
            totalProgress: parseInt(stats.progress_count),
            wordsByType: {
                verb: parseInt(stats.verbs_count),
                adjective: parseInt(stats.adjectives_count),
                noun: parseInt(stats.nouns_count)
            },
            activeUsers: parseInt(stats.active_users_count),
            recentActivity: recentActivity.rows.map(r => ({
                userId: r.user_id,
                contentType: r.content_type,
                updatedAt: r.updated_at
            }))
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
