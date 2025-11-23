import express from 'express';
import { query } from '../database/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run database migration
router.get('/setup-database', async (req, res) => {
    try {
        console.log('🔄 Starting database schema setup...');

        // Read schema.sql file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await query(schema);

        console.log('✅ Database schema created successfully!');

        res.json({
            success: true,
            message: 'Database schema created successfully!',
            tables: [
                'users',
                'words',
                'texts',
                'unknown_words',
                'user_progress',
                'leaderboard',
                'quiz_history',
                'exam_results',
                'reading_progress',
                'books'
            ]
        });
    } catch (error) {
        console.error('❌ Database setup error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            hint: 'Check if DATABASE_URL is set correctly'
        });
    }
});

// Migrate data from db.json to PostgreSQL
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        // Get counts for each table
        const counts = {};
        for (const row of result.rows) {
            const tableName = row.table_name;
            const countResult = await query(`SELECT COUNT(*) as count FROM ${ tableName } `);
            counts[tableName] = parseInt(countResult.rows[0].count);
        }

        res.json({
            success: true,
            tables: result.rows.map(r => r.table_name),
            count: result.rows.length,
            data: counts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
