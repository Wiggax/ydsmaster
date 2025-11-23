import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToUpdate = [
    'src/pages/AdminDashboard.jsx',
    'src/pages/Dashboard.jsx',
    'src/pages/GameFill.jsx',
    'src/pages/GameMatch.jsx',
    'src/pages/Leaderboard.jsx',
    'src/pages/ProPurchase.jsx',
    'src/pages/Reading.jsx',
    'src/pages/ReadingDetail.jsx',
    'src/pages/Flashcards.jsx',
    'src/pages/UnknownWords.jsx'
];

console.log('Updating files to use Storage utility...\n');

filesToUpdate.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Skipping ${filePath} - file not found`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Add import if not present
    if (!content.includes("import { Storage } from")) {
        // Find the last import statement
        const importRegex = /^import .+;$/gm;
        const imports = content.match(importRegex);
        if (imports && imports.length > 0) {
            const lastImport = imports[imports.length - 1];
            content = content.replace(lastImport, lastImport + "\nimport { Storage } from '../utils/storage';");
            modified = true;
        }
    }

    // Replace localStorage.getItem with await Storage.getItem
    if (content.includes("localStorage.getItem('token')")) {
        content = content.replace(/localStorage\.getItem\('token'\)/g, "await Storage.getItem('token')");
        modified = true;
    }

    // Make functions async if they use Storage
    if (content.includes("await Storage.getItem")) {
        // Find functions that use await Storage but aren't async
        const functionRegex = /(const\s+\w+\s*=\s*)\(([^)]*)\)\s*=>\s*\{/g;
        content = content.replace(functionRegex, (match, prefix, params) => {
            if (!match.includes('async')) {
                return `${prefix}async (${params}) => {`;
            }
            return match;
        });
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated ${filePath}`);
    } else {
        console.log(`⏭️  No changes needed for ${filePath}`);
    }
});

console.log('\n✅ All files updated!');
