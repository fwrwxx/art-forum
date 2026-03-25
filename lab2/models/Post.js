const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Заголовок не може бути порожнім' },
            len: { args: [3, 200], msg: 'Заголовок має бути від 3 до 200 символів' }
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Вміст не може бути порожнім' }
        }
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'posts',
    timestamps: true
});

module.exports = Post;