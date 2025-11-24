import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const DB_JSON_PATH = path.join(PROJECT_ROOT, 'db.json');
const SEEDS_SQL_PATH = path.join(PROJECT_ROOT, 'server', 'database', 'seeds.sql');

const FILES = [
    { name: 'fiiller.txt', type: 'verb' },
    { name: 'sıfatlar.txt', type: 'adjective' },
    { name: 'isimler.txt', type: 'noun' }
];

function generateId(text) {
    return crypto.createHash('md5').update(text).digest('hex').substring(0, 24);
}

async function processFiles() {
    let sqlStatements = [];

    // Removed truncation to preserve existing words and books data.
    // sqlStatements.push('TRUNCATE TABLE words, books CASCADE;');

    // Read existing db.json to preserve other data
    console.log('Reading db.json...');
    const dbData = JSON.parse(await fs.readFile(DB_JSON_PATH, 'utf-8'));

    const newWords = [];

    // Process Words
    for (const file of FILES) {
        const filePath = path.join(PROJECT_ROOT, file.name);
        console.log(`Processing ${file.name}...`);

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');

            for (const line of lines) {
                if (!line.trim()) continue;

                // Format: 1. analyze - analiz etmek - examine - The researcher analyzed the data to identify significant trends.
                // Regex to parse: Number. Term - Definition - Synonym - Example

                // Normalize separators
                const normalizedLine = line.replace(/–/g, '-');

                // Split by " - "
                const parts = normalizedLine.split(' - ').map(p => p.trim());

                if (parts.length >= 2) {
                    // Remove numbering from the first part (Term)
                    const termMatch = parts[0].match(/^\d+\.\s*(.+)/);
                    const term = termMatch ? termMatch[1] : parts[0];

                    const definition_tr = parts[1];
                    const synonyms = parts[2] || ''; // Might be empty
                    const example = parts[3] || ''; // Might be empty

                    // Generate deterministic ID based on term
                    const id = generateId(term);

                    const wordObj = {
                        id,
                        term,
                        type: file.type,
                        definition_tr,
                        synonyms,
                        examples: example ? [example] : []
                    };

                    newWords.push(wordObj);

                    // SQL Statement
                    const safeTerm = term.replace(/'/g, "''");
                    const safeDef = definition_tr.replace(/'/g, "''");
                    const safeSynonyms = synonyms ? synonyms.replace(/'/g, "''") : '';
                    const safeType = file.type;
                    const safeExamples = example ? JSON.stringify([example]).replace(/'/g, "''") : '[]';

                    sqlStatements.push(`INSERT INTO words (id, term, definition_tr, type, synonyms, examples) VALUES ('${id}', '${safeTerm}', '${safeDef}', '${safeType}', '${safeSynonyms}', '${safeExamples}') ON CONFLICT (id) DO NOTHING;`);
                }
            }
        } catch (err) {
            console.error(`Error processing ${file.name}:`, err);
        }
    }

    // Process Books from db.json
    if (dbData.books && dbData.books.length > 0) {
        console.log(`Processing ${dbData.books.length} books from db.json...`);
        sqlStatements.push('\n-- Seeds for books');

        for (const book of dbData.books) {
            const safeTitle = book.title.replace(/'/g, "''");
            const safeAuthor = book.author ? book.author.replace(/'/g, "''") : '';
            const safeContent = book.content ? book.content.replace(/'/g, "''") : '';
            const safeDifficulty = book.difficulty || 'B2';
            const isPro = book.isPro ? 'TRUE' : 'FALSE';

            // Use existing ID or generate one
            const id = book.id || generateId(book.title);

            sqlStatements.push(`INSERT INTO books (id, title, author, content, difficulty, is_pro) VALUES ('${id}', '${safeTitle}', '${safeAuthor}', '${safeContent}', '${safeDifficulty}', ${isPro}) ON CONFLICT (id) DO NOTHING;`);
        }
    } else {
        console.log('No books found in db.json');
    }

    // Update db.json with new words (optional, but keeps it in sync)
    dbData.words = newWords;
    await fs.writeFile(DB_JSON_PATH, JSON.stringify(dbData, null, 2));
    console.log(`Updated db.json with ${newWords.length} words.`);

    // Write seeds.sql
    const sqlContent = `-- Seeds for words and books\n${sqlStatements.join('\n')}`;
    await fs.writeFile(SEEDS_SQL_PATH, sqlContent);
    console.log(`Created seeds.sql with ${sqlStatements.length} insert statements.`);
}

processFiles().catch(console.error);
