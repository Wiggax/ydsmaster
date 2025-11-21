import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get current user's statistics
router.get('/stats', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        await db.read();

        const user = db.data.users.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate daily streak based on last_login
        let dailyStreak = 0;
        if (user.last_login) {
            const lastLogin = new Date(user.last_login);
            const today = new Date();
            const diffTime = Math.abs(today - lastLogin);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // If logged in today or yesterday, maintain streak
            if (diffDays <= 1) {
                dailyStreak = user.dailyStreak || 1;

                // If it's a new day, increment streak
                const lastLoginDate = lastLogin.toDateString();
                const todayDate = today.toDateString();
                if (lastLoginDate !== todayDate && diffDays === 1) {
                    dailyStreak += 1;
                    user.dailyStreak = dailyStreak;
                    await db.write();
                }
            } else {
                // Streak broken, reset to 1
                dailyStreak = 1;
                user.dailyStreak = 1;
                await db.write();
            }
        } else {
            dailyStreak = 1;
            user.dailyStreak = 1;
            await db.write();
        }

        // Get user's unknown words (learned words)
        const unknownWords = db.data.unknown_words?.filter(uw => uw.userId === userId) || [];
        const learnedCount = unknownWords.length;

        // Get user's progress for score calculation
        const userProgress = db.data.user_progress?.filter(p => p.userId === userId) || [];

        // Calculate score based on activities
        // Each flashcard session: 10 points
        // Each game completed: 20 points
        // Each reading completed: 15 points
        let score = 0;
        userProgress.forEach(progress => {
            // Use actual score from metadata if available
            if (progress.metadata && typeof progress.metadata.score === 'number') {
                score += progress.metadata.score;
            } else {
                // Fallback to fixed points for legacy/other progress
                if (progress.contentType === 'flashcard') {
                    score += 10;
                } else if (progress.contentType === 'game') {
                    score += 20;
                } else if (progress.contentType === 'reading') {
                    score += 15;
                }
            }
        });

        // Calculate accuracy from game results
        // For now, we'll use a simple calculation based on progress
        // In a real app, you'd track correct/incorrect answers
        let accuracy = 0;
        if (userProgress.length > 0) {
            // Base accuracy on completion rate
            const completedActivities = userProgress.filter(p => p.completed).length;
            accuracy = Math.round((completedActivities / userProgress.length) * 100);

            // Ensure accuracy is between 0-100
            accuracy = Math.max(0, Math.min(100, accuracy));
        }

        // If no progress yet, show 0% instead of NaN
        if (isNaN(accuracy)) {
            accuracy = 0;
        }

        res.json({
            dailyStreak,
            score,
            learnedCount,
            accuracy,
            totalActivities: userProgress.length
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
    try {
        await db.read();
        const users = db.data.users;
        const userProgress = db.data.user_progress || [];

        // Calculate score for each user
        const leaderboard = users
            .filter(user => {
                // Exclude admins
                if (user.role === 'admin') return false;
                // Exclude test users (username contains 'test')
                if (user.username.toLowerCase().includes('test')) return false;
                return true;
            })
            .map(user => {
                const userActivities = userProgress.filter(p => p.userId === user.id);
                let score = 0;

                userActivities.forEach(progress => {
                    if (progress.metadata && typeof progress.metadata.score === 'number') {
                        score += progress.metadata.score;
                    } else {
                        // Fallback logic matching stats endpoint
                        if (progress.contentType === 'flashcard') score += 10;
                        else if (progress.contentType === 'game') score += 20;
                        else if (progress.contentType === 'reading') score += 15;
                    }
                });

                return {
                    id: user.id,
                    username: user.username,
                    score,
                    role: user.role,
                    created_at: user.created_at
                };
            });

        // Sort by score desc, then by created_at asc (earlier registration wins tie)
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return new Date(a.created_at) - new Date(b.created_at);
        });

        // Return top 50
        res.json(leaderboard.slice(0, 50));
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

export default router;
