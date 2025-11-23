import express from 'express';
import db from '../db.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Migration endpoint - Admin only
router.post('/migrate-unknown-words-fields', authenticate, authorizeAdmin, async (req, res) => {
    try {
        console.log('🔄 Starting migration: userId/wordId → user_id/word_id');

        db.data.unknown_words ??= [];

        let migratedCount = 0;
        let alreadyMigratedCount = 0;

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
            console.log(`✓ Migrated: userId ${uw.userId} → user_id ${migrated.user_id}`);

            return migrated;
        });

        await db.write();

        console.log(`✅ Migration complete!`);
        console.log(`   - Migrated: ${migratedCount} records`);
        console.log(`   - Already migrated: ${alreadyMigratedCount} records`);
        console.log(`   - Total: ${db.data.unknown_words.length} records`);

        res.json({
            success: true,
            message: 'Migration completed successfully',
            stats: {
                migrated: migratedCount,
                alreadyMigrated: alreadyMigratedCount,
                total: db.data.unknown_words.length
            }
        });
    } catch (error) {
        console.error('❌ Migration error:', error);
        res.status(500).json({
            success: false,
            error: 'Migration failed',
            details: error.message
        });
    }
});

export default router;
