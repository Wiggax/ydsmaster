import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const adapter = new JSONFile('db.json');
const db = new Low(adapter, {});

async function fixUsersPro() {
    await db.read();

    console.log(`Checking ${db.data.users.length} users for isPro field...`);

    let fixed = 0;
    for (const user of db.data.users) {
        if (user.isPro === undefined) {
            user.isPro = false;
            fixed++;
            console.log(`Added isPro=false to user: ${user.username} (${user.email})`);
        }
    }

    if (fixed > 0) {
        await db.write();
        console.log(`Fixed ${fixed} users by adding isPro field`);
    } else {
        console.log('All users already have isPro field');
    }

    // Show current Pro users
    const proUsers = db.data.users.filter(u => u.isPro);
    console.log(`\nCurrent Pro users (${proUsers.length}):`);
    proUsers.forEach(u => {
        console.log(`  - ${u.username} (${u.email}): isPro=${u.isPro}`);
    });
}

fixUsersPro().catch(console.error);
