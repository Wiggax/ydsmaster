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

// Upload and migrate data via POST
router.post('/upload-data', async (req, res) => {
    try {
        console.log('🔄 Starting data migration from uploaded data...');

        const dbData = req.body;
        let migratedCounts = {
            words: 0,
            texts: 0,
            books: 0
        };

        // Migrate Words
        if (dbData.words && dbData.words.length > 0) {
            console.log(`Migrating ${dbData.words.length} words...`);
            for (const word of dbData.words) {
                try {
                    await query(
                        `INSERT INTO words (id, term, definition_tr, type, examples, created_at)
                         VALUES ($1, $2, $3, $4, $5, $6)
                         ON CONFLICT (id) DO NOTHING`,
                        [
                            word.id,
                            word.term,
                            word.definition_tr,
                            word.type,
                            word.examples || null,
                            word.created_at || new Date().toISOString()
                        ]
                    );
                    migratedCounts.words++;
                    if (migratedCounts.words % 100 === 0) {
                        console.log(`  Migrated ${migratedCounts.words} words...`);
                    }
                } catch (err) {
                    console.error(`Error migrating word ${word.id}:`, err.message);
                }
            }
        }

        // Migrate Texts
        if (dbData.texts && dbData.texts.length > 0) {
            console.log(`Migrating ${dbData.texts.length} texts...`);
            for (const text of dbData.texts) {
                try {
                    await query(
                        `INSERT INTO texts (id, title, content, difficulty, created_at)
                         VALUES ($1, $2, $3, $4, $5)
                         ON CONFLICT (id) DO NOTHING`,
                        [
                            text.id,
                            text.title,
                            text.content,
                            text.difficulty || null,
                            text.created_at || new Date().toISOString()
                        ]
                    );
                    migratedCounts.texts++;
                } catch (err) {
                    console.error(`Error migrating text ${text.id}:`, err.message);
                }
            }
        }

        // Migrate Books
        if (dbData.books && dbData.books.length > 0) {
            console.log(`Migrating ${dbData.books.length} books...`);
            for (const book of dbData.books) {
                try {
                    await query(
                        `INSERT INTO books (id, title, author, content, difficulty, is_pro, created_at)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                         ON CONFLICT (id) DO NOTHING`,
                        [
                            book.id,
                            book.title,
                            book.author || null,
                            book.content,
                            book.difficulty || null,
                            book.isPro || false,
                            book.created_at || new Date().toISOString()
                        ]
                    );
                    migratedCounts.books++;
                } catch (err) {
                    console.error(`Error migrating book ${book.id}:`, err.message);
                }
            }
        }

        console.log('✅ Data migration completed!', migratedCounts);

        res.json({
            success: true,
            message: 'Data migration completed successfully!',
            migrated: migratedCounts
        });
    } catch (error) {
        console.error('❌ Data migration error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Check database status
router.get('/check-database', async (req, res) => {
    try {
        const result = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        // Get counts for each table
        const counts = {};
        for (const row of result.rows) {
            const tableName = row.table_name;
            const countResult = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
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

// Run database seeding
router.get('/seed-database', async (req, res) => {
    try {
        console.log('🔄 Starting database seeding...');

        const seedsPath = path.join(__dirname, '../database/seeds.sql');
        const fileContent = fs.readFileSync(seedsPath, 'utf8');

        // Split by semicolon and newline to get individual statements
        // We assume each statement ends with ;
        const statements = fileContent.split(';').map(s => s.trim()).filter(s => s.length > 0);

        console.log(`Found ${statements.length} statements to execute.`);

        // Execute in batches to avoid timeout but keep it faster than line-by-line
        const BATCH_SIZE = 100;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i += BATCH_SIZE) {
            const batch = statements.slice(i, i + BATCH_SIZE);
            const batchQuery = batch.join(';') + ';'; // Re-join with semicolons

            try {
                await query(batchQuery);
                successCount += batch.length;
                if (i % 500 === 0) console.log(`Processed ${i} / ${statements.length} statements...`);
            } catch (err) {
                console.error(`Error executing batch at index ${i}:`, err.message);
                // Fallback: Try executing this batch line-by-line to find the culprit
                for (const stmt of batch) {
                    try {
                        await query(stmt + ';');
                        successCount++;
                    } catch (innerErr) {
                        console.error('Failed statement:', stmt.substring(0, 100) + '...');
                        console.error('Error:', innerErr.message);
                        errorCount++;
                    }
                }
            }
        }

        console.log(`✅ Database seeding completed. Success: ${successCount}, Errors: ${errorCount}`);

        res.json({
            success: true,
            message: `Database seeded! Success: ${successCount}, Errors: ${errorCount}`
        });
    } catch (error) {
        console.error('❌ Database seeding error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Run database schema migration
router.get('/migrate-schema', async (req, res) => {
    try {
        console.log('🔄 Starting database schema migration...');

        // Read schema.sql file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await query(schema);

        // Add missing columns to users table if they don't exist
        try {
            await query(`
                ALTER TABLE users 
                ALTER COLUMN id TYPE BIGINT;
                
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
                ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
                ADD COLUMN IF NOT EXISTS pro_platform VARCHAR(50),
                ADD COLUMN IF NOT EXISTS pro_transaction_id VARCHAR(255),
                ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT FALSE;
            `);
            console.log('✅ Users table updated (ID type and columns)');
        } catch (err) {
            console.log('⚠️ Users table update skipped or failed (columns might already exist):', err.message);
        }

        console.log('✅ Database schema migrated successfully!');

        res.json({
            success: true,
            message: 'Database schema migrated successfully!'
        });
    } catch (error) {
        console.error('❌ Database schema migration error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
