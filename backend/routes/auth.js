const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Adjust the path to your User model

const router = express.Router();

// Password reset route
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate random temporary password
        const generateRandomPassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            let password = '';
            for (let i = 0; i < 12; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        };

        const temporaryPassword = generateRandomPassword();

        // Hash the temporary password using the same method as registration
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);

        // Update user's password in database
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });

        // Send email with temporary password
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'ShelfSpot - Password Reset',
            html: `
        <h2>Password Reset</h2>
        <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
        <p>Please log in with this temporary password and change it immediately for security reasons.</p>
        <p>If you didn't request this password reset, please contact support.</p>
      `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: 'Temporary password sent to your email address'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

module.exports = router;