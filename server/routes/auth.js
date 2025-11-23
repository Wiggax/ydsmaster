import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/db.js';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', async (req, res) => {
    const { username, email, password, phone, securityQuestion, securityAnswer } = req.body;

    if (!username || !email || !password || !phone || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if email or phone already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 OR phone = $2',
            [email, phone]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email or phone already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);

        const result = await query(
            `INSERT INTO users (username, email, password_hash, phone, security_question, security_answer, role, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
             RETURNING id`,
            [username, email, hashedPassword, phone, securityQuestion, hashedAnswer, 'user']
        );

        const newUserId = result.rows[0].id;

        // Initialize leaderboard entry for new user
        await query(
            'INSERT INTO leaderboard (user_id, score, rank) VALUES ($1, $2, $3)',
            [newUserId, 0, 0]
        );

        res.status(201).json({ message: 'User registered successfully', userId: newUserId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    try {
        const result = await query(
            'SELECT id, username, email, password_hash, role, is_pro, is_deleted FROM users WHERE email = $1 OR username = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check if user is deleted
        if (user.is_deleted) {
            return res.status(403).json({ error: 'This account has been deleted. Please contact support if this is a mistake.' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

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
                isPro: !!user.is_pro
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify security answer (for forgot password)
router.post('/verify-security', async (req, res) => {
    const { email, securityAnswer } = req.body;

    if (!email || !securityAnswer) {
        return res.status(400).json({ error: 'Email and security answer are required' });
    }

    try {
        const result = await query(
            'SELECT id, security_question, security_answer FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        if (!user.security_question || !user.security_answer) {
            return res.status(400).json({ error: 'No security question set for this account' });
        }

        const validAnswer = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.security_answer);
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
            securityQuestion: user.security_question
        });
    } catch (error) {
        console.error('Verify security error:', error);
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

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await query(
            'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
            [hashedPassword, decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Reset token expired' });
        }
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get security question by email
router.post('/get-security-question', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const result = await query(
            'SELECT security_question FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        if (!user.security_question) {
            return res.status(400).json({ error: 'No security question set for this account' });
        }

        res.json({ securityQuestion: user.security_question });
    } catch (error) {
        console.error('Get security question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
