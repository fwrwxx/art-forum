const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Ім\'я не може бути порожнім' },
            len: { args: [2, 100], msg: 'Ім\'я має бути від 2 до 100 символів' }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: 'Невірний формат email' },
            notEmpty: { msg: 'Email не може бути порожнім' }
        }
    },
    role: {
        type: DataTypes.ENUM('artist', 'collector', 'admin'),
        defaultValue: 'artist'
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'users',
    timestamps: true
});

module.exports = User;