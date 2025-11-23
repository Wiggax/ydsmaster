import fs from 'fs';
import axios from 'axios';

async function uploadAndMigrate() {
    try {
        console.log('📖 Reading db.json...');
        const dbData = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

        console.log('📊 Data summary:');
        console.log(`  Words: ${dbData.words?.length || 0}`);
        console.log(`  Texts: ${dbData.texts?.length || 0}`);
        console.log(`  Books: ${dbData.books?.length || 0}`);

        console.log('\n🚀 Uploading to Render...');
        const response = await axios.post(
            'https://ydsmaster.onrender.com/api/migrate/upload-data',
            dbData,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            }
        );

        console.log('\n✅ Migration completed!');
        console.log(response.data);
    } catch (error) {
        console.error('❌ Migration failed:', error.response?.data || error.message);
    }
}

uploadAndMigrate();
