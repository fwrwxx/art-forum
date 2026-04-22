const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `http://localhost:${process.env.PORT}/api/auth/verify-email/${token}`;
    
    const mailOptions = {
        from: `"ArtHub Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Email Verification - ArtHub',
        html: `
            <h1>Welcome to ArtHub!</h1>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>This link expires in 24 hours.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password/${token}`;
    
    const mailOptions = {
        from: `"ArtHub Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset - ArtHub',
        html: `
            <h1>Password Reset Request</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link expires in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };