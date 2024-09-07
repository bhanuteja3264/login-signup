const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Ensure this path is correct
const router = express.Router(); // Initialize the router
require('dotenv').config(); // Load environment variables from .env file

// Configure Nodemailer with debug options
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // 587 for TLS or 465 for SSL
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Use environment variable for email
        pass: process.env.EMAIL_PASS  // Use environment variable for password
    },
    debug: true, // Enable debug output
    logger: true // Log information in console
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user with the provided email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }

        // Generate a reset token and expiration time
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration

        // Save the user's reset token and expiration time to the database
        await user.save();

        // Create the reset URL
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        // Set up the email options
        const mailOptions = {
            from: `"Your App Name" <${process.env.EMAIL_USER}>`, // Sender email with a name
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the following link to reset your password: ${resetUrl}`,
            html: `<p>You requested a password reset. Click the following link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>` // HTML version of the email
        };

        // Send the email using Nodemailer
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error.message); // log the full error message
                return res.status(500).json({ message: 'Error sending email' });
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ message: 'Reset link sent to your email' });
            }
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; // Export the router to use in the main app
