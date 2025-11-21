import { JSONFilePreset } from 'lowdb/node';

// Default data structure
const defaultData = {
    users: [],
    words: [],
    user_progress: [],
    texts: [],
    unknown_words: []
};

// Initialize DB
const db = await JSONFilePreset('db.json', defaultData);

export default db;
