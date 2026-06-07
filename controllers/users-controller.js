import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/GenerateToken.js';

export const register = async (req, res, next) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required'
            });
        }

        // First, check if email already exists
        const checkEmailQuery = 'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL';

        db.query(checkEmailQuery, [email], async (err, results) => {
            if (err) {
                console.error('Error checking email:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            // If email exists, return error
            if (results.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            try {
                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Insert new user
                const insertQuery = 'INSERT INTO users(name, email, password, role) VALUES(?, ?, ?, ?)';

                db.query(insertQuery, [name, email, hashedPassword, role], async (err, result) => {
                    if (err) {
                        console.error('Error inserting user:', err);
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                    const userData = {
                        id: result.insertId,
                        name: name,
                        email: email,
                        role: role
                    };

                    // Generate JWT token after successful insertion
                    const { AccessToken, RefreshToken } = generateToken(userData);

                    // Store refresh token in database
                    const updateRefreshTokenQuery = 'UPDATE users SET refreshToken = ? WHERE id = ?';
                    db.query(updateRefreshTokenQuery, [RefreshToken, result.insertId], (updateErr) => {
                        if (updateErr) {
                            console.error('Error storing refresh token:', updateErr);
                            // Continue anyway as the user is already created
                        }
                    });

                    // Set cookies
                    res.cookie('token', AccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 15 * 60 * 1000 // 15 minutes
                    });

                    res.cookie('refreshToken', RefreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                    });

                    res.status(201).json({
                        success: true,
                        message: 'User registered successfully',
                        result: {
                            id: result.insertId,
                            email: email,
                            name: name,
                            role: role
                        },
                        token: AccessToken
                    });
                });
            } catch (hashError) {
                console.error('Error hashing password:', hashError);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    } catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email (excluding soft-deleted users)
        const findUserQuery = 'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL';

        db.query(findUserQuery, [email], async (err, results) => {
            if (err) {
                console.error('Error finding user:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            // Check if user exists
            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const user = results[0];

            try {
                // Compare password
                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid email or password'
                    });
                }

                // Generate JWT tokens
                const userData = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                };

                const { AccessToken, RefreshToken } = generateToken(userData);

                // Update refresh token in database
                const updateRefreshTokenQuery = 'UPDATE users SET refreshToken = ? WHERE id = ?';
                db.query(updateRefreshTokenQuery, [RefreshToken, user.id], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating refresh token:', updateErr);
                    }
                });

                // Set cookies
                res.cookie('token', AccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000 // 15 minutes
                });

                res.cookie('refreshToken', RefreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });

                // Send response
                res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    result: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    },
                    token: AccessToken
                });

            } catch (compareError) {
                console.error('Error comparing passwords:', compareError);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    } catch (error) {
        next(error);
    }
};