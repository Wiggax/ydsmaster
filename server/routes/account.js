import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { query } from '../database/db.js';

const router = express.Router();

// Delete user account (Soft Delete)
router.delete('/delete', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user exists
        const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Prevent admin from deleting their own account
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin accounts cannot be deleted through this endpoint' });
        }

        // Soft delete: Mark as deleted instead of removing
        await query(
            'UPDATE users SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
            [userId]
        );

        res.json({
            message: 'Account deleted successfully',
            deletedUser: {
                email: user.email,
                name: user.username
            }
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Failed to delete account', error: error.message });
    }
});

export default router;
