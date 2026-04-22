const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { sequelize, testConnection } = require('./models');
const { errorLogger, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorLogger);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await testConnection();
        await sequelize.sync({ alter: false });
        
        app.listen(PORT, () => {
            console.log(`   Server running on http://localhost:${PORT}`);
            console.log(`   API Documentation:`);
            console.log(`   POST   /api/auth/register     - Register`);
            console.log(`   POST   /api/auth/login        - Login`);
            console.log(`   POST   /api/auth/logout       - Logout`);
            console.log(`   POST   /api/auth/refresh-token- Refresh Token`);
            console.log(`   GET    /api/profile/me        - My Profile`);
            console.log(`   PUT    /api/profile/me        - Update Profile`);
            console.log(`   PUT    /api/profile/me/change-password - Change Password`);
            console.log(`   GET    /api/users             - All Users (Admin)`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();