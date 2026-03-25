const { Sequelize } = require('sequelize');
require('dotenv').config();

// Створення підключення до бази даних
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Функція для перевірки підключення
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Підключення до MySQL успішне!');
        console.log(`База даних: ${process.env.DB_NAME}`);
    } catch (error) {
        console.error('Помилка підключення до MySQL:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, testConnection };