import db from './config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        // First, check if email already exists
        const checkEmailQuery = 'SELECT * FROM api_test WHERE email = ?';
        
        db.query(checkEmailQuery, [email], async (err, results) => {
            if (err) {
                console.error('Error checking email:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            
            // If email exists, return error
            if (results.length > 0) {
                return res.status(409).json({ message: 'Email already exists' });
            }
            
            try {
                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                
                // Insert new user
                const insertQuery = 'INSERT INTO api_test(name, email, password) VALUES(?, ?, ?)';
                
                db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
                    if (err) {
                        console.error('Error inserting user:', err);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                    
                    // Generate JWT token after successful insertion
                    const token = jwt.sign(
                        { id: result.insertId, email: email }, 
                        process.env.JWT_SECRET_KEY, 
                        { expiresIn: '1h' }
                    );
                    
                    res.status(201).json({
                        success: true,
                        message: 'User registered successfully',
                        result: {
                            id: result.insertId,
                            email: email,
                            name: name
                        },
                        token
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