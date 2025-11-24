import pkg from 'pg';
const { Pool } = pkg;

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

// Helper function to execute queries
export async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Query error:', { text, error: error.message });
        throw error;
    }
}

// Helper function to get a client from the pool
export async function getClient() {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);

    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5 seconds!');
    }, 5000);

    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
        client.lastQuery = args;
        return query(...args);
    };

    client.release = () => {
        clearTimeout(timeout);
        client.query = query;
        client.release = release;
        return release();
    };

    return client;
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database tables
export async function initializeDatabase() {
    try {
        console.log('🔄 Initializing PostgreSQL database...');

        // Test connection
        await query('SELECT NOW()');

        // Check if words table exists
        try {
            await query('SELECT count(*) FROM words LIMIT 1');
        } catch (error) {
            console.log('⚠️ Words table not found or error accessing it. Running schema...');
            const schemaPath = path.join(__dirname, 'schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schemaSql = fs.readFileSync(schemaPath, 'utf8');
                await query(schemaSql);
                console.log('✅ Schema executed successfully');
            } else {
                console.error('❌ Schema file not found at:', schemaPath);
            }
        }

        // Check if data exists
        const result = await query('SELECT count(*) FROM words');
        const count = parseInt(result.rows[0].count);

        if (count === 0) {
            console.log('⚠️ Database appears empty. Seeding data...');
            const seedPath = path.join(__dirname, 'seeds.sql');
            if (fs.existsSync(seedPath)) {
                const seedSql = fs.readFileSync(seedPath, 'utf8');
                await query(seedSql);
                console.log('✅ Database seeded successfully');
            } else {
                console.error('❌ Seeds file not found at:', seedPath);
            }
        } else {
            console.log(`✅ Database already contains ${count} words. Skipping seed.`);
        }

        console.log('✅ PostgreSQL database initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        throw error;
    }
}

export default pool;
