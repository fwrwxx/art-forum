const crypto = require('crypto');
const { User, RefreshToken } = require('../models');
const { generateTokens, refreshAccessToken, revokeRefreshToken } = require('../services/tokenService');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

// Реєстрація
const register = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            email,
            password_hash: password,
            full_name,
            email_verification_token: verificationToken,
            is_email_verified: false
        });

        await sendVerificationEmail(email, verificationToken);

        const { accessToken, refreshToken } = await generateTokens(user);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for verification.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// Авторизація (Логін)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (user.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Account is locked. Please try again later.'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            await user.incrementLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        await user.resetLoginAttempts();

        const { accessToken, refreshToken } = await generateTokens(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        
        if (refreshToken) {
            await revokeRefreshToken(refreshToken);
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const result = await refreshAccessToken(refreshToken);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

// Підтвердження email
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            where: { email_verification_token: token }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        user.is_email_verified = true;
        user.email_verification_token = null;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        });
    }
};

// Запит на відновлення пароля
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.password_reset_token = resetToken;
        user.password_reset_expires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        await sendPasswordResetEmail(email, resetToken);

        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset request'
        });
    }
};

// Скидання пароля
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({
            where: {
                password_reset_token: token,
                password_reset_expires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        user.password_hash = newPassword;
        user.password_reset_token = null;
        user.password_reset_expires = null;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword
};