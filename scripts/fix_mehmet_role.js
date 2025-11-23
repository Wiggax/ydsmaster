import db from '../server/db.js';

async function fixMehmetRole() {
    await db.read();

    const usersToFix = ['mehmet31@gmail.com', 'mehmet123@gmail.com'];
    let updated = false;

    for (const email of usersToFix) {
        const user = db.data.users.find(u => u.email === email);
        if (user) {
            console.log(`Found user: ${user.username} (${user.email})`);
            if (user.role !== 'admin') {
                user.role = 'admin';
                user.isPro = true;
                updated = true;
                console.log(`Updated ${user.username} to admin.`);
            } else {
                console.log(`${user.username} is already admin.`);
            }
        } else {
            console.log(`User with email ${email} not found.`);
        }
    }

    if (updated) {
        await db.write();
        console.log('Database updated successfully.');
    } else {
        console.log('No changes needed.');
    }
}

fixMehmetRole();
