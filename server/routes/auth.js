import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', async (req, res) => {
    const { username, email, password, phone, securityQuestion, securityAnswer } = req.body;

    if (!username || !email || !password || !phone || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const { users } = db.data;

    if (users.find(u => u.email === email || u.phone === phone)) {
        return res.status(409).json({ error: 'Email or phone already exists' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Hash security answer for extra security
        const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);

        const newUser = {
            id: Date.now(),
            username,
            email,
            password_hash: hashedPassword,
            phone,
            securityQuestion,
            securityAnswer: hashedAnswer,
            role: 'user', // Default role
            created_at: new Date().toISOString()
        };

        await db.update(({ users }) => users.push(newUser));

        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Allow login with username OR email for admin convenience (optional, but good for 'Wiggax')
    // But standard is email. Let's check if input matches email OR username.

    if (!email || !password) { // 'email' param here acts as identifier
        return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    const user = db.data.users.find(u => u.email === email || u.username === email);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is deleted
    if (user.isDeleted) {
        return res.status(403).json({ error: 'This account has been deleted. Please contact support if this is a mistake.' });
    }

    try {
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login (in memory only for performance)
        user.last_login = new Date().toISOString();
        // await db.write(); // Removed to prevent blocking on every login


        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role || 'user' },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user',
                isPro: !!user.isPro
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify security answer (for forgot password)
router.post('/verify-security', async (req, res) => {
    const { email, securityAnswer } = req.body;

    if (!email || !securityAnswer) {
        return res.status(400).json({ error: 'Email and security answer are required' });
    }

    const user = db.data.users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!user.securityQuestion || !user.securityAnswer) {
        return res.status(400).json({ error: 'No security question set for this account' });
    }

    try {
        const validAnswer = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer);
        if (!validAnswer) {
            return res.status(401).json({ error: 'Incorrect answer' });
        }

        // Generate a temporary token for password reset
        const resetToken = jwt.sign(
            { id: user.id, purpose: 'password-reset' },
            SECRET_KEY,
            { expiresIn: '15m' }
        );

        res.json({
            success: true,
            resetToken,
            securityQuestion: user.securityQuestion
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    try {
        const decoded = jwt.verify(resetToken, SECRET_KEY);

        if (decoded.purpose !== 'password-reset') {
            return res.status(401).json({ error: 'Invalid reset token' });
        }

        const user = db.data.users.find(u => u.id === decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password_hash = hashedPassword;
        await db.write();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Reset token expired' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get security question by email
router.post('/get-security-question', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.data.users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!user.securityQuestion) {
        return res.status(400).json({ error: 'No security question set for this account' });
    }

    res.json({ securityQuestion: user.securityQuestion });
});

export default router;
