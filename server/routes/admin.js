import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorizeAdmin);

// Get all users with stats
router.get('/users', async (req, res) => {
    try {
        db.data.users ??= [];
        db.data.unknown_words ??= [];
        db.data.user_progress ??= [];

        const users = db.data.users.map(user => {
            const unknownCount = db.data.unknown_words.filter(
                uw => uw.userId === user.id
            ).length;

            const progressCount = db.data.user_progress.filter(
                p => p.userId === user.id
            ).length;

            const lastProgress = db.data.user_progress
                .filter(p => p.userId === user.id)
                .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0];

            return {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role || 'user',
                isPro: !!user.isPro,
                isDeleted: !!user.isDeleted,
                deletedAt: user.deletedAt || null,
                createdAt: user.created_at,
                lastLogin: user.last_login || null,
                securityQuestion: user.securityQuestion || null,
                stats: {
                    unknownWordsCount: unknownCount,
                    progressCount,
                    lastActivity: lastProgress?.updatedAt || lastProgress?.createdAt || null
                }
            };
        });

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

        db.data.users ??= [];
        db.data.unknown_words ??= [];
        db.data.user_progress ??= [];

        const user = db.data.users.find(u => u.id === normalizedUserId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const unknownWords = db.data.unknown_words
            .filter(uw => uw.userId === normalizedUserId)
            .map(uw => {
                const word = db.data.words.find(w => String(w.id) === String(uw.wordId));
                return {
                    ...uw,
                    word: word || null
                };
            });

        const progress = db.data.user_progress.filter(
            p => p.userId === normalizedUserId
        );

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role || 'user',
            isPro: !!user.isPro,
            createdAt: user.created_at,
            lastLogin: user.last_login || null,
            stats: {
                unknownWordsCount: unknownWords.length,
                unknownWords,
                progressCount: progress.length,
                progress
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

        db.data.users ??= [];
        db.data.unknown_words ??= [];
        db.data.user_progress ??= [];

        const userIndex = db.data.users.findIndex(u => u.id === normalizedUserId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Soft delete: Mark as deleted instead of removing
        db.data.users[userIndex].isDeleted = true;
        db.data.users[userIndex].deletedAt = new Date().toISOString();

        await db.write();
        res.json({ message: 'User deleted successfully' });
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

        db.data.users ??= [];

        // Check if email already exists
        const emailExists = db.data.users.find(u => u.email === email);
        if (emailExists) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Check if phone already exists
        const phoneExists = db.data.users.find(u => u.phone === phone);
        if (phoneExists) {
            return res.status(409).json({ error: 'Phone number already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now(),
            username,
            email,
            password_hash: hashedPassword,
            phone,
            role: 'user',
            isPro: !!isPro,
            created_at: new Date().toISOString()
        };

        db.data.users.push(newUser);
        await db.write();

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                isPro: newUser.isPro
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

        const user = db.data.users.find(u => u.id === normalizedUserId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Ensure isPro field exists
        if (user.isPro === undefined) {
            user.isPro = false;
        }

        user.isPro = !user.isPro;
        await db.write();

        res.json({
            message: `User Pro status updated to ${user.isPro}`,
            isPro: user.isPro
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

        const user = db.data.users.find(u => u.id === normalizedUserId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.role = role;
        await db.write();

        res.json({
            message: `User role updated to ${role}`,
            role: user.role
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

        const user = db.data.users.find(u => u.id === normalizedUserId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password_hash = hashedPassword;
        user.passwordResetAt = new Date().toISOString();
        user.passwordResetBy = req.user.id;

        await db.write();

        res.json({
            success: true,
            message: 'Password reset successfully',
            newPassword: newPassword // Return the password so admin can give it to user
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Get system stats
router.get('/stats', async (req, res) => {
    try {
        db.data.users ??= [];
        db.data.words ??= [];
        db.data.texts ??= [];
        db.data.unknown_words ??= [];
        db.data.user_progress ??= [];

        const stats = {
            users: db.data.users.length,
            words: db.data.words.length,
            texts: db.data.texts.length,
            totalUnknownWords: db.data.unknown_words.length,
            totalProgress: db.data.user_progress.length,
            wordsByType: {
                verb: db.data.words.filter(w => w.type === 'verb').length,
                adjective: db.data.words.filter(w => w.type === 'adjective').length,
                noun: db.data.words.filter(w => w.type === 'noun').length
            },
            activeUsers: new Set(db.data.unknown_words.map(uw => uw.userId)).size,
            recentActivity: db.data.user_progress
                .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
                .slice(0, 10)
                .map(p => ({
                    userId: p.userId,
                    contentType: p.contentType,
                    updatedAt: p.updatedAt || p.createdAt
                }))
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
