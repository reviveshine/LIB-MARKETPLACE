const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// In-memory user storage (replace with database in production)
let users = [];

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, userType, phoneNumber, goblelly } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !password || !userType) {
            return res.status(400).json({
                error: 'Basic fields are required',
                required: ['firstName', 'lastName', 'email', 'password', 'userType']
            });
        }

        // Buyer-specific validation
        if (userType === 'buyer' || userType === 'both') {
            if (!phoneNumber) {
                return res.status(400).json({
                    error: 'Phone number is required for buyers',
                    message: 'Buyers must provide a phone number for verification and order notifications'
                });
            }

            if (!goblelly) {
                return res.status(400).json({
                    error: 'Goblelly verification is required for buyers',
                    message: 'Buyers must complete Goblelly verification to enable buying capabilities'
                });
            }

            // Validate phone number format (basic US format)
            const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
            if (!phoneRegex.test(phoneNumber)) {
                return res.status(400).json({
                    error: 'Invalid phone number format',
                    message: 'Phone number must be in format: (555) 123-4567'
                });
            }

            // Validate Goblelly verification code format
            const goblellyRegex = /^GB-[A-Z0-9]{8}$/;
            if (!goblellyRegex.test(goblelly)) {
                return res.status(400).json({
                    error: 'Invalid Goblelly verification code',
                    message: 'Goblelly verification code must be in format: GB-XXXXXXXX'
                });
            }
        }

        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'A user with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user with buyer verification data
        const newUser = {
            id: users.length + 1,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            userType,
            createdAt: new Date().toISOString(),
            isVerified: false,
            // Add buyer-specific fields
            ...(userType === 'buyer' || userType === 'both' ? {
                phoneNumber,
                goblelly,
                verificationLevel: 'phone_and_goblelly',
                buyerVerificationCompleted: true
            } : {
                verificationLevel: 'basic',
                buyerVerificationCompleted: false
            })
        };

        users.push(newUser);

        // Remove password from response
        const { password: _, ...userResponse } = newUser;

        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse,
            verificationStatus: {
                basic: true,
                phone: userType === 'buyer' || userType === 'both',
                goblelly: userType === 'buyer' || userType === 'both'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: error.message
        });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find user
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Generate JWT token (using a simple secret for demo)
        const token = jwt.sign(
            { userId: user.id, email: user.email, userType: user.userType },
            process.env.JWT_SECRET || 'lib-marketplace-secret',
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userResponse } = user;

        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: error.message
        });
    }
});

// Get current user endpoint
router.get('/me', (req, res) => {
    // This would normally use authentication middleware
    res.json({
        message: 'User profile endpoint',
        note: 'Authentication middleware not implemented yet'
    });
});

module.exports = router;