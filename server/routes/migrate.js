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
router.get('/migrate-data', async (req, res) => {
    try {
        console.log('🔄 Starting data migration from db.json...');

        // Read db.json file
        const dbPath = path.join(__dirname, '../db.json');

        if (!fs.existsSync(dbPath)) {
            return res.status(404).json({
                success: false,
                error: 'db.json file not found',
                hint: 'No data to migrate'
            });
        }

        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        let migratedCounts = {
            words: 0,
            texts: 0,
            books: 0,
            yds_exams: 0
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
            migrated: migratedCounts,
            total: {
                words: dbData.words?.length || 0,
                texts: dbData.texts?.length || 0,
                books: dbData.books?.length || 0
            }
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

export default router;
