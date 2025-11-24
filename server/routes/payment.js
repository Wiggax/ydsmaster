import express from 'express';
import { query } from '../database/db.js';
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

        // Check if user exists
        const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        // Update user to Pro with 1 month subscription
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        await query(
            `UPDATE users 
             SET is_pro = TRUE, 
                 subscription_start_date = $1, 
                 subscription_end_date = $2, 
                 pro_platform = $3, 
                 pro_transaction_id = $4, 
                 auto_renew = TRUE 
             WHERE id = $5`,
            [startDate, endDate, platform, transactionId, userId]
        );

        res.json({
            success: true,
            message: 'Pro subscription activated',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isPro: true,
                role: user.role,
                subscriptionEndDate: endDate.toISOString()
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
        const result = await query(
            'SELECT is_pro, subscription_end_date, auto_renew FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        let isPro = user.is_pro || false;

        // Check if subscription is still valid
        if (isPro && user.subscription_end_date) {
            const expiry = new Date(user.subscription_end_date);
            if (expiry < new Date()) {
                isPro = false;
                // Optionally update DB to reflect expired status
                // await query('UPDATE users SET is_pro = FALSE WHERE id = $1', [userId]);
            }
        }

        res.json({
            isPro: isPro,
            subscriptionEndDate: user.subscription_end_date || null,
            autoRenew: user.auto_renew || false
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

        const result = await query('SELECT is_pro FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Mock restore - check if user already has Pro
        if (user.is_pro) {
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
