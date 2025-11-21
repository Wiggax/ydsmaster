import express from 'express';
import { authenticate } from '../middleware/auth.js';

import db from '../db.js';

const router = express.Router();

// Delete user account
// Delete user account (Soft Delete)
router.delete('/delete', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Read database
        await db.read();
        const user = db.data.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting their own account
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin accounts cannot be deleted through this endpoint' });
        }

        // Soft delete: Mark as deleted instead of removing
        user.isDeleted = true;
        user.deletedAt = new Date().toISOString();

        // Save changes
        await db.write();

        res.json({
            message: 'Account deleted successfully',
            deletedUser: {
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Failed to delete account', error: error.message });
    }
});

export default router;
