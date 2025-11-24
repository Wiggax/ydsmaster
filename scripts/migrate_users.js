import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const DB_JSON_PATH = path.join(PROJECT_ROOT, 'db.json');
const SEEDS_SQL_PATH = path.join(PROJECT_ROOT, 'server', 'database', 'seeds.sql');

// Correct password hash for Burak.0303
const CORRECT_ADMIN_HASH = '$2a$10$NLvvYV/yAN3eguX4nnAsBeNPv1y0o0fKd2dWCMHDfG2zCUM4C/z1K';

async function migrateUsers() {
    console.log('Reading db.json...');
    const dbData = JSON.parse(await fs.readFile(DB_JSON_PATH, 'utf-8'));

    let sqlStatements = [];
    sqlStatements.push('\n-- Seeds for users');

    // Migrate Users
    if (dbData.users && dbData.users.length > 0) {
        console.log(`Processing ${dbData.users.length} users...`);
        for (const user of dbData.users) {
            const safeUsername = user.username.replace(/'/g, "''");
            const safeEmail = user.email.replace(/'/g, "''");
            const safePhone = user.phone ? user.phone.replace(/'/g, "''") : '';

            // Fix admin password hash
            let safePassword = user.password_hash || '';
            if (user.email === 'burakuzunn03@gmail.com') {
                safePassword = CORRECT_ADMIN_HASH;
                console.log('✓ Fixed admin password hash');
            }

            const role = user.role || 'user';
            const isPro = user.isPro ? 'TRUE' : 'FALSE';
            const createdAt = user.created_at || new Date().toISOString();

            // Handle optional fields
            const lastLogin = user.last_login ? `'${user.last_login}'` : 'NULL';
            const isDeleted = user.is_deleted ? 'TRUE' : 'FALSE';

            // Subscription fields
            const subStart = user.subscriptionStartDate ? `'${user.subscriptionStartDate}'` : 'NULL';
            const subEnd = user.subscriptionEndDate ? `'${user.subscriptionEndDate}'` : 'NULL';
            const proPlatform = user.proPlatform ? `'${user.proPlatform}'` : 'NULL';
            const proTxId = user.proTransactionId ? `'${user.proTransactionId}'` : 'NULL';
            const autoRenew = user.autoRenew ? 'TRUE' : 'FALSE';

            sqlStatements.push(`
INSERT INTO users (id, username, email, password_hash, phone, role, is_pro, created_at, last_login, is_deleted, subscription_start_date, subscription_end_date, pro_platform, pro_transaction_id, auto_renew)
VALUES (${user.id}, '${safeUsername}', '${safeEmail}', '${safePassword}', '${safePhone}', '${role}', ${isPro}, '${createdAt}', ${lastLogin}, ${isDeleted}, ${subStart}, ${subEnd}, ${proPlatform}, ${proTxId}, ${autoRenew})
ON CONFLICT (id) DO UPDATE SET 
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    is_pro = EXCLUDED.is_pro,
    role = EXCLUDED.role;
            `.trim());
        }
    }

    // Append to seeds.sql
    await fs.appendFile(SEEDS_SQL_PATH, '\n' + sqlStatements.join('\n'));
    console.log(`Appended ${dbData.users.length} users to seeds.sql`);
}

migrateUsers().catch(console.error);
