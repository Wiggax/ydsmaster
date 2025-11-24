import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const DB_JSON_PATH = path.join(PROJECT_ROOT, 'db.json');
const SEEDS_SQL_PATH = path.join(PROJECT_ROOT, 'server', 'database', 'seeds.sql');

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
            const safePassword = user.password_hash || ''; // Assuming hash is safe-ish but good to be careful
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

            // We need to preserve the ID if possible, but users.id is SERIAL (integer) in schema.
            // db.json ids are timestamps (big integers).
            // PostgreSQL SERIAL is usually integer (up to 2 billion). BigInt is needed for timestamps.
            // Let's check schema.sql. users.id is SERIAL (integer).
            // 1763624631956 is too large for standard INTEGER (max 2,147,483,647).
            // We MUST change users.id to BIGSERIAL or BIGINT in schema.sql OR map IDs.
            // Mapping IDs is risky for foreign keys.
            // Changing schema is better.

            // For now, let's generate the INSERT statement assuming schema will be fixed or is compatible.
            // Actually, I should check schema.sql again.

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
