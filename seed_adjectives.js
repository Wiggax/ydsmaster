import fs from 'fs';
import db from './server/db.js';

const filePath = 'C:/Users/Burak/Desktop/Sıfatlar.txt';

function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    if (current.length > 0) {
        values.push(current.trim());
    }

    return values;
}

async function seedAdjectives() {
    try {
        console.log('Reading Adjectives file...');
        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split(/\r?\n/);

        await db.read();
        db.data.words ??= [];

        let added = 0;
        const existingTerms = new Set(
            db.data.words.filter(w => w.type === 'adjective').map(w => w.term.toLowerCase())
        );

        console.log('Total words in DB:', db.data.words.length);
        console.log('Existing adjectives in DB:', existingTerms.size);

        for (let rawLine of lines) {
            const line = rawLine.trim();
            if (!line || line.startsWith('Kelime')) continue;

            const parts = parseCSVLine(line);
            if (parts.length < 4) continue;

            const [termRaw, synonymsRaw, exampleRaw, definitionRaw] = parts;
            const term = termRaw.trim();
            const synonyms = synonymsRaw.trim();
            const example = exampleRaw.trim().replace(/^"|"$/g, '');
            const definition_tr = definitionRaw.trim();

            if (!term || !definition_tr) continue;
            if (existingTerms.has(term.toLowerCase())) continue;

            db.data.words.push({
                id: `${Date.now()}${Math.random().toString(36).slice(2, 10)}`,
                term,
                type: 'adjective',
                definition_tr,
                synonyms,
                examples: [example],
            });

            existingTerms.add(term.toLowerCase());
            added++;
        }

        await db.write();
        console.log(`Successfully seeded ${added} adjective cards.`);
    } catch (error) {
        console.error('Error seeding adjectives:', error);
    }
}

seedAdjectives();
