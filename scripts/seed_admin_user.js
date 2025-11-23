import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcryptjs';

const adapter = new JSONFile('db.json');
const db = new Low(adapter, {});

async function seedAdmin() {
    await db.read();

    // Find admin user
    const adminEmail = 'burakuzunn03@gmail.com';
    const adminPassword = 'Burak.0303';

    const adminUser = db.data.users.find(u => u.email === adminEmail);

    if (adminUser) {
        // Update password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        adminUser.password_hash = hashedPassword;
        adminUser.role = 'admin';
        adminUser.isPro = true;
        console.log('Admin user password updated successfully');
    } else {
        // Create new admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const newAdmin = {
            id: Date.now(),
            username: 'Admin',
            email: adminEmail,
            password_hash: hashedPassword,
            phone: '5059940783',
            role: 'admin',
            isPro: true,
            created_at: new Date().toISOString()
        };
        db.data.users.push(newAdmin);
        console.log('Admin user created successfully');
    }

    await db.write();
}

seedAdmin().catch(console.error);
