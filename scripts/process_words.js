import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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

async function processFiles() {
    let sqlStatements = [];

    // Read existing db.json to preserve other data
    console.log('Reading db.json...');
    const dbData = JSON.parse(await fs.readFile(DB_JSON_PATH, 'utf-8'));

    const newWords = [];

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

                    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

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

    // Update db.json
    dbData.words = newWords;
    await fs.writeFile(DB_JSON_PATH, JSON.stringify(dbData, null, 2));
    console.log(`Updated db.json with ${newWords.length} words.`);

    // Write seeds.sql
    const sqlContent = `-- Seeds for words\n${sqlStatements.join('\n')}`;
    await fs.writeFile(SEEDS_SQL_PATH, sqlContent);
    console.log(`Created seeds.sql with ${sqlStatements.length} insert statements.`);
}

processFiles().catch(console.error);
