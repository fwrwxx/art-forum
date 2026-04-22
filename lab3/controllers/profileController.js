const { User } = require('../models');

// Отримання свого профілю
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'full_name', 'role', 'is_email_verified', 'created_at']
        });

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Оновлення профілю
const updateProfile = async (req, res) => {
    try {
        const { full_name, email } = req.body;

        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        await req.user.update({
            full_name: full_name || req.user.full_name,
            email: email || req.user.email
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: req.user.id,
                email: req.user.email,
                full_name: req.user.full_name
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Зміна пароля
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const isPasswordValid = await req.user.comparePassword(currentPassword);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        req.user.password_hash = newPassword;
        await req.user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getMyProfile,
    updateProfile,
    changePassword
};