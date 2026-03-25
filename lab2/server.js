const express = require('express');
const dotenv = require('dotenv');
const { sequelize, testConnection } = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========== НАЛАШТУВАННЯ КОДУВАННЯ UTF-8 ==========
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// Middleware для правильного кодування UTF-8 у відповідях
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

// Логування запитів
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Імпортуємо моделі
const User = require('./models/User');
const Post = require('./models/Post');

// Встановлення зв'язків
User.hasMany(Post, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Post.belongsTo(User, { 
    foreignKey: 'userId'
});

// ========== МАРШРУТИ ==========

// Кореневий маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'Лабораторна робота №2',
        description: 'Робота з MySQL та Sequelize',
        endpoints: {
            users: {
                GET_all: 'GET /api/users',
                GET_one: 'GET /api/users/:id',
                POST: 'POST /api/users',
                PUT: 'PUT /api/users/:id',
                DELETE: 'DELETE /api/users/:id'
            },
            posts: {
                GET_all: 'GET /api/posts',
                GET_one: 'GET /api/posts/:id',
                POST: 'POST /api/posts',
                PUT: 'PUT /api/posts/:id',
                DELETE: 'DELETE /api/posts/:id',
                GET_user_posts: 'GET /api/posts/user/:userId'
            },
            stats: {
                GET: 'GET /api/stats'
            }
        }
    });
});

// ========== КОРИСТУВАЧІ ==========

// Отримати всіх користувачів
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [{
                model: Post,
                attributes: ['id', 'title', 'status', 'views', 'createdAt']
            }]
        });
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Помилка:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Отримати користувача за ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            include: [{
                model: Post,
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
app.post('/api/users', async (req, res) => {
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
app.put('/api/users/:id', async (req, res) => {
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
app.delete('/api/users/:id', async (req, res) => {
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

// ========== ПОСТИ ==========

// Отримати всі пости
app.get('/api/posts', async (req, res) => {
    try {
        const { status, userId } = req.query;
        const where = {};

        if (status) where.status = status;
        if (userId) where.userId = userId;

        const posts = await Post.findAll({
            where,
            include: [{
                model: User,
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
});

// Отримати пост за ID
app.get('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id, {
            include: [{
                model: User,
                attributes: ['id', 'name', 'email', 'avatar']
            }]
        });

        if (!post) {
            return res.status(404).json({ success: false, error: 'Пост не знайдено' });
        }

        await post.increment('views');
        
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Створити новий пост
app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, status, userId } = req.body;

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
});

// Оновити пост
app.put('/api/posts/:id', async (req, res) => {
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
});

// Видалити пост
app.delete('/api/posts/:id', async (req, res) => {
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
});

// Отримати пости користувача
app.get('/api/posts/user/:userId', async (req, res) => {
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
});

// ========== СТАТИСТИКА ==========
app.get('/api/stats', async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalPosts = await Post.count();
        const publishedPosts = await Post.count({ where: { status: 'published' } });
        const draftPosts = await Post.count({ where: { status: 'draft' } });
        
        // Виправлено: використовуємо правильний синтаксис для підрахунку
        const usersByRole = await User.findAll({
            attributes: [
                'role',
                [sequelize.fn('COUNT', sequelize.col('User.id')), 'count']
            ],
            group: ['role']
        });
        
        const postsByStatus = await Post.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('Post.id')), 'count']
            ],
            group: ['status']
        });
        
        // Отримати користувача з найбільшою кількістю постів (виправлено)
        const topUser = await User.findAll({
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('posts.id')), 'postCount']
            ],
            include: [{
                model: Post,
                attributes: [],
                required: false
            }],
            group: ['User.id'],
            order: [[sequelize.literal('postCount'), 'DESC']],
            limit: 1,
            raw: true
        });
        
        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    byRole: usersByRole
                },
                posts: {
                    total: totalPosts,
                    published: publishedPosts,
                    draft: draftPosts,
                    byStatus: postsByStatus
                },
                topAuthor: topUser && topUser[0] && topUser[0].postCount > 0 ? {
                    id: topUser[0].id,
                    name: topUser[0].name,
                    postCount: parseInt(topUser[0].postCount)
                } : null
            }
        });
    } catch (error) {
        console.error('Помилка статистики:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== ОБРОБКА ПОМИЛОК ==========

// Обробка 404
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Маршрут не знайдено' });
});

// Глобальна обробка помилок
app.use((err, req, res, next) => {
    console.error('Помилка:', err);
    res.status(500).json({ success: false, error: 'Внутрішня помилка сервера' });
});

// ========== ЗАПУСК СЕРВЕРА ==========
const startServer = async () => {
    try {
        await testConnection();
        
        // Синхронізація моделей з БД
        await sequelize.sync({ alter: true });
        console.log('✅ Моделі синхронізовано з базою даних');
        
        // Перевірка чи є дані в таблиці users
        const userCount = await User.count();
        if (userCount === 0) {
            console.log('📝 Додаємо тестові дані...');
            
            // Створення тестових користувачів
            const users = await User.bulkCreate([
                { name: 'Іван Петренко', email: 'ivan@example.com', role: 'artist', bio: 'Художник-ілюстратор' },
                { name: 'Марія Шевченко', email: 'maria@example.com', role: 'artist', bio: 'Цифровий художник' },
                { name: 'Олексій Коваленко', email: 'oleksiy@example.com', role: 'collector', bio: 'Колекціонер мистецтва' },
                { name: 'Анна Мельник', email: 'anna@example.com', role: 'admin', bio: 'Адміністратор платформи' }
            ]);
            
            // Створення тестових постів
            await Post.bulkCreate([
                { title: 'Вступ до цифрового живопису', content: 'У цій статті я розповім про основи цифрового живопису...', status: 'published', userId: 1 },
                { title: 'Як обрати графічний планшет', content: 'Поради для початківців щодо вибору графічного планшета...', status: 'published', userId: 1 },
                { title: 'Моя творча подорож', content: 'Розповідь про те, як я почала займатися мистецтвом...', status: 'published', userId: 2 }
            ]);
            
            console.log(`✅ Додано ${users.length} користувачів та 3 пости`);
        }
        
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
            console.log(`📊 API доступне за адресою: http://localhost:${PORT}/api`);
            console.log('\n📋 Доступні ендпоінти:');
            console.log('   Users:');
            console.log('     GET    /api/users              - всі користувачі');
            console.log('     GET    /api/users/:id          - користувач за ID');
            console.log('     POST   /api/users              - створити користувача');
            console.log('     PUT    /api/users/:id          - оновити користувача');
            console.log('     DELETE /api/users/:id          - видалити користувача');
            console.log('   Posts:');
            console.log('     GET    /api/posts              - всі пости');
            console.log('     GET    /api/posts/:id          - пост за ID');
            console.log('     GET    /api/posts/user/:userId - пости користувача');
            console.log('     POST   /api/posts              - створити пост');
            console.log('     PUT    /api/posts/:id          - оновити пост');
            console.log('     DELETE /api/posts/:id          - видалити пост');
            console.log('   Stats:');
            console.log('     GET    /api/stats              - статистика');
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('❌ Помилка запуску сервера:', error);
        process.exit(1);
    }
};

startServer();