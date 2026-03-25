const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

// Отримати всіх користувачів
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [{
                model: Post,
                as: 'posts',
                attributes: ['id', 'title', 'status', 'views']
            }]
        });
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Отримати користувача за ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            include: [{
                model: Post,
                as: 'posts',
                attributes: ['id', 'title', 'content', 'status', 'views', 'createdAt']
            }]
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Користувача не знайдено' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Створити нового користувача
router.post('/', async (req, res) => {
    try {
        const { name, email, role, bio } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ success: false, error: 'Користувач з таким email вже існує' });
        }

        const user = await User.create({ name, email, role, bio });
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ success: false, error: error.errors.map(e => e.message) });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// Оновити користувача
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, bio, isActive } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Користувача не знайдено' });
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ success: false, error: 'Користувач з таким email вже існує' });
            }
        }

        await user.update({ name, email, role, bio, isActive });
        res.json({ success: true, data: user });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ success: false, error: error.errors.map(e => e.message) });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// Видалити користувача
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Користувача не знайдено' });
        }

        await user.destroy();
        res.json({ success: true, message: 'Користувача успішно видалено' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;