const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const router = express.Router();

// Store the client ID and secret in environment variables
const CLIENT_ID = '42848796817-t8udgt4jstp07omdlj1v1rhurevd0dv8.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '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'; // Use the environment variable or fallback to hardcoded value

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);

// Traditional email/password signup
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Google Sign-Up
router.post('/google-signup', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();

        // Check if the user already exists
        let user = await User.findOne({ email: payload.email });
        if (!user) {
            // If the user doesn't exist, create a new one
            user = new User({
                email: payload.email,
                name: payload.name,
                googleId: payload.sub,
                // You can add more fields as required
            });
            await user.save();
        }

        const jwtPayload = { user: { id: user.id } };
        const jwtToken = jwt.sign(jwtPayload, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ token: jwtToken });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Google Sign-In failed' });
    }
});

module.exports = router;
