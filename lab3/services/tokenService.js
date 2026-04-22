const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { RefreshToken } = require('../models');

const generateTokens = async (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
        token: refreshToken,
        user_id: user.id,
        expires_at: expiresAt,
        is_revoked: false
    });

    return { accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        const storedToken = await RefreshToken.findOne({
            where: {
                token: refreshToken,
                user_id: decoded.id,
                is_revoked: false
            }
        });

        if (!storedToken || new Date() > new Date(storedToken.expires_at)) {
            throw new Error('Invalid or expired refresh token');
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            throw new Error('User not found');
        }

        const newAccessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return { accessToken: newAccessToken };
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

const revokeRefreshToken = async (refreshToken) => {
    await RefreshToken.update(
        { is_revoked: true },
        { where: { token: refreshToken } }
    );
};

module.exports = { generateTokens, refreshAccessToken, revokeRefreshToken };