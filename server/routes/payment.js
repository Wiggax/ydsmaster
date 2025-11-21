import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Mock payment endpoint - In production, integrate with App Store/Google Play
router.post('/purchase-pro', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { platform, transactionId } = req.body; // platform: 'ios' | 'android' | 'web'

        // In production:
        // - Verify transaction with Apple/Google servers
        // - Check receipt validity
        // - Prevent duplicate purchases

        // For now, mock verification
        if (!transactionId) {
            return res.status(400).json({ error: 'Transaction ID required' });
        }

        // Find user
        const user = db.data.users.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user to Pro
        // Update user to Pro with 1 month subscription
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        user.isPro = true;
        user.subscriptionStartDate = startDate.toISOString();
        user.subscriptionEndDate = endDate.toISOString();
        user.proPlatform = platform;
        user.proTransactionId = transactionId;
        user.autoRenew = true; // Default for app stores

        await db.write();

        res.json({
            success: true,
            message: 'Pro subscription activated',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isPro: user.isPro,
                role: user.role,
                subscriptionEndDate: user.subscriptionEndDate
            }
        });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ error: 'Failed to process purchase' });
    }
});

// Check Pro status
router.get('/pro-status', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = db.data.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if subscription is still valid
        let isPro = user.isPro || false;
        if (isPro && user.subscriptionEndDate) {
            const expiry = new Date(user.subscriptionEndDate);
            if (expiry < new Date()) {
                isPro = false;
                // Optionally update DB to reflect expired status
                // user.isPro = false;
                // await db.write();
            }
        }

        res.json({
            isPro: isPro,
            subscriptionEndDate: user.subscriptionEndDate || null,
            autoRenew: user.autoRenew || false
        });
    } catch (error) {
        console.error('Pro status check error:', error);
        res.status(500).json({ error: 'Failed to check Pro status' });
    }
});

// Restore purchases (for app stores)
router.post('/restore-purchase', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { platform, receipt } = req.body;

        // In production:
        // - Verify receipt with Apple/Google
        // - Restore Pro status if valid

        const user = db.data.users.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Mock restore - check if user already has Pro
        if (user.isPro) {
            return res.json({
                success: true,
                message: 'Pro subscription restored',
                isPro: true
            });
        }

        res.json({
            success: false,
            message: 'No previous purchase found'
        });
    } catch (error) {
        console.error('Restore purchase error:', error);
        res.status(500).json({ error: 'Failed to restore purchase' });
    }
});

export default router;
