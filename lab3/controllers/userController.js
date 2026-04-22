const { User, sequelize } = require('../models');

// Отримання всіх користувачів (тільки для адміна)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'full_name', 'role', 'is_email_verified', 'created_at']
        });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Отримання користувача за ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'email', 'full_name', 'role', 'created_at']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Оновлення користувача (тільки для адміна)
const updateUser = async (req, res) => {
    try {
        const { role, full_name, is_email_verified } = req.body;
        
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.update({
            role: role || user.role,
            full_name: full_name || user.full_name,
            is_email_verified: is_email_verified !== undefined ? is_email_verified : user.is_email_verified
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Видалення користувача
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.destroy();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};