import fs from 'fs';
import db from './server/db.js';

const filePath = 'C:\\Users\\Burak\\Desktop\\yeni fiiller.txt';

async function seedVerbs() {
    try {
        console.log('Reading file...');
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        await db.read();
        const words = db.data.words || [];

        let count = 0;

        console.log('Parsing lines...');
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('Fiil,Eş Anlam')) continue; // Skip empty lines and headers

            // Handle potential CSV parsing issues (simple split for now, assuming no commas in fields except as separators)
            // The format is: Fiil,Eş Anlam(ları),Örnek Cümle,Türkçe Anlamı
            // But some fields might contain commas. A robust regex or CSV parser is better.
            // Let's try a regex that handles quoted fields if they exist, or just simple split if not.
            // Looking at the file, it seems simple enough:
            // appreciate,value; respect,I appreciate your help,takdir etmek; minnettar olmak

            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma, ignoring commas in quotes

            if (parts.length < 4) continue;

            const term = parts[0].trim();
            const synonyms = parts[1].trim();
            const example = parts[2].trim();
            const definition_tr = parts[3].trim();

            // Check if word already exists to avoid duplicates
            if (words.find(w => w.term === term && w.type === 'verb')) continue;

            const newWord = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                term: term,
                type: 'verb',
                definition_tr: definition_tr,
                synonyms: synonyms,
                examples: [example]
            };

            words.push(newWord);
            count++;
        }

        db.data.words = words;
        await db.write();

        console.log(`Successfully seeded ${count} verbs.`);

    } catch (error) {
        console.error('Error seeding verbs:', error);
    }
}

seedVerbs();
