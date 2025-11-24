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
    let allWords = [];
    let sqlStatements = [];

    // Read existing db.json to preserve other data
    console.log('Reading db.json...');
    const dbData = JSON.parse(await fs.readFile(DB_JSON_PATH, 'utf-8'));
    
    // Clear existing words or keep them? The user said "re-upload", implying replacement or addition.
    // Given the context "kelime kartları bozulduğu için", it's safer to replace the words from these files
    // but we should check if we want to keep existing ones. 
    // For now, let's assume we are REPLACING the words from these files, but maybe keeping others?
    // Actually, the user said "kelime kartlarını tekrar oluşturup", so let's rebuild the words list from these files.
    // However, to be safe, let's just append or update.
    // But wait, the user provided specific files to be the source.
    // Let's start with a fresh list of words from these files to ensure clean data.
    
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
                // Note: The separator seems to be " - " or " – " (en dash) based on file view.
                
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
                    // Escape single quotes for SQL
                    const safeTerm = term.replace(/'/g, "''");
                    const safeDef = definition_tr.replace(/'/g, "''");
                    const safeType = file.type;
                    const safeExamples = example ? JSON.stringify([example]).replace(/'/g, "''") : '[]';
                    
                    // Note: synonyms are not in the schema shown in schema.sql (words table), 
                    // but they are in db.json. 
                    // schema.sql: id, term, definition_tr, type, examples, created_at
                    // We should probably add synonyms to definition or examples or ignore them for SQL if not in schema.
                    // Wait, looking at schema.sql again:
                    // CREATE TABLE IF NOT EXISTS words (
                    //     id VARCHAR(50) PRIMARY KEY,
                    //     term VARCHAR(255) NOT NULL,
                    //     definition_tr TEXT NOT NULL,
                    //     type VARCHAR(50) NOT NULL,
                    //     examples TEXT,
                    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    // );
                    // It doesn't have synonyms column. 
                    // We can append synonyms to definition or examples, or just ignore.
                    // Let's append to definition for now like "Definition (Synonym)" or just ignore if not critical.
                    // Actually, db.json has "synonyms" field. 
                    // Let's check if we can alter the schema or just fit it in.
                    // For now, let's stick to the schema.
                    
                    sqlStatements.push(`INSERT INTO words (id, term, definition_tr, type, examples) VALUES ('${id}', '${safeTerm}', '${safeDef}', '${safeType}', '${safeExamples}') ON CONFLICT (id) DO NOTHING;`);
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
