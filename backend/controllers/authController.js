
import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// REGISTER USER
export const register = async (req, res) => {
    try {
        const { name, membershipId, password } = req.body;

        if (!name || !membershipId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters.'
            });
        }

        const [existing] = await db.execute(
            'SELECT id FROM users WHERE membership_id = ?',
            [membershipId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Membership ID already exists.'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [result] = await db.execute(
            `INSERT INTO users
             (name, membership_id, password_hash, role)
             VALUES (?, ?, ?, 'member')`,
            [name, membershipId, passwordHash]
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful.',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);

        res.status(500).json({
            success: false,
            message: 'Registration failed.'
        });
    }
};

// LOGIN USER
export const login = async (req, res) => {
    try {
        const { membershipId, password } = req.body;

        if (!membershipId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Membership ID and password are required.'
            });
        }

        const [users] = await db.execute(
            `SELECT id, name, membership_id, password_hash, role
             FROM users
             WHERE membership_id = ?`,
            [membershipId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid membership ID or password.'
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid membership ID or password.'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                membershipId: user.membership_id,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({
            success: false,
            message: 'Login failed.'
        });
    }
};
