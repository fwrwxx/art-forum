const Post = require('../models/Post');
const User = require('../models/User');

// Отримати всі пости
const getAllPosts = async (req, res) => {
    try {
        const { status, userId } = req.query;
        const where = {};

        if (status) where.status = status;
        if (userId) where.userId = userId;

        const posts = await Post.findAll({
            where,
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'email', 'avatar']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Отримати пост за ID
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id, {
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'email', 'avatar']
            }]
        });

        if (!post) {
            return res.status(404).json({ success: false, error: 'Пост не знайдено' });
        }

        // Збільшуємо лічильник переглядів
        await post.increment('views');
        
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Створити новий пост
const createPost = async (req, res) => {
    try {
        const { title, content, status, userId } = req.body;

        // Перевірка існування користувача
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Користувача не знайдено' });
        }

        const post = await Post.create({ title, content, status, userId });
        
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ success: false, error: error.errors.map(e => e.message) });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// Оновити пост
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, status } = req.body;

        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).json({ success: false, error: 'Пост не знайдено' });
        }

        await post.update({ title, content, status });
        res.json({ success: true, data: post });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ success: false, error: error.errors.map(e => e.message) });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// Видалити пост
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ success: false, error: 'Пост не знайдено' });
        }

        await post.destroy();
        res.json({ success: true, message: 'Пост успішно видалено' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Отримати пости користувача
const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Користувача не знайдено' });
        }

        const posts = await Post.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            user: { id: user.id, name: user.name },
            count: posts.length,
            data: posts
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getUserPosts
};