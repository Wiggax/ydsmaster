import db from './server/db.js';
import bcrypt from 'bcryptjs';

async function fixAdmin() {
    await db.read();
    const adminUser = db.data.users.find(u => u.username === 'Wiggax');

    if (adminUser) {
        console.log('Found admin user:', adminUser.username);

        const newPassword = 'Burak.0303';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        adminUser.email = 'burakuzunn03@gmail.com';
        adminUser.password_hash = hashedPassword;
        adminUser.role = 'admin'; // Ensure admin role
        adminUser.isPro = true; // Admin should be Pro

        await db.write();
        console.log('Admin user updated successfully.');
    } else {
        console.log('Admin user not found. Creating...');
        const newPassword = 'Burak.0303';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const newAdmin = {
            id: Date.now(),
            username: 'Wiggax', // Keeping username as Wiggax per context, though email is login
            email: 'burakuzunn03@gmail.com',
            password_hash: hashedPassword,
            phone: '0000000000', // Placeholder
            role: 'admin',
            isPro: true,
            created_at: new Date().toISOString()
        };

        db.data.users.push(newAdmin);
        await db.write();
        console.log('Admin user created successfully.');
    }
}

fixAdmin();
