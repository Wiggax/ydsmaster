import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

// PostgreSQL connection
const client = new Client({
    connectionString: 'postgresql://ydsmaster:7ThSnDqwC3Py8I5RwjV7bPCmoxVJEhE3@dpg-d4hmad8dl3ps739sisn0-a.frankfurt-postgres.render.com/ydsmaster',
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrateData() {
    try {
        console.log('🔄 Connecting to PostgreSQL...');
        await client.connect();
        console.log('✅ Connected!');

        // Read db.json
        console.log('📖 Reading db.json...');
        const dbData = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

        let counts = {
            words: 0,
            texts: 0,
            books: 0
        };

        // Migrate Words
        if (dbData.words && dbData.words.length > 0) {
            console.log(`\n🔄 Migrating ${dbData.words.length} words...`);
            for (const word of dbData.words) {
                try {
                    await client.query(
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
                    counts.words++;
                    if (counts.words % 100 === 0) {
                        console.log(`  ✓ Migrated ${counts.words} words...`);
                    }
                } catch (err) {
                    console.error(`  ❌ Error migrating word ${word.id}:`, err.message);
                }
            }
            console.log(`✅ Migrated ${counts.words} words!`);
        }

        // Migrate Texts
        if (dbData.texts && dbData.texts.length > 0) {
            console.log(`\n🔄 Migrating ${dbData.texts.length} texts...`);
            for (const text of dbData.texts) {
                try {
                    await client.query(
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
                    counts.texts++;
                } catch (err) {
                    console.error(`  ❌ Error migrating text ${text.id}:`, err.message);
                }
            }
            console.log(`✅ Migrated ${counts.texts} texts!`);
        }

        // Migrate Books
        if (dbData.books && dbData.books.length > 0) {
            console.log(`\n🔄 Migrating ${dbData.books.length} books...`);
            for (const book of dbData.books) {
                try {
                    await client.query(
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
                    counts.books++;
                } catch (err) {
                    console.error(`  ❌ Error migrating book ${book.id}:`, err.message);
                }
            }
            console.log(`✅ Migrated ${counts.books} books!`);
        }

        console.log('\n🎉 Migration completed successfully!');
        console.log('📊 Summary:', counts);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.end();
        console.log('👋 Disconnected from PostgreSQL');
    }
}

migrateData();
