const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user'
        },
        is_email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        email_verification_token: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        password_reset_token: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        password_reset_expires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        login_attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        locked_until: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: true,
        underscored: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password_hash) {
                    user.password_hash = await bcrypt.hash(user.password_hash, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password_hash')) {
                    user.password_hash = await bcrypt.hash(user.password_hash, 10);
                }
            }
        }
    });

    User.prototype.comparePassword = async function(password) {
        return await bcrypt.compare(password, this.password_hash);
    };

    User.prototype.isLocked = function() {
        return this.locked_until && new Date() < new Date(this.locked_until);
    };

    User.prototype.incrementLoginAttempts = async function() {
        this.login_attempts += 1;
        if (this.login_attempts >= process.env.MAX_LOGIN_ATTEMPTS) {
            this.locked_until = new Date(Date.now() + process.env.LOGIN_LOCK_TIME * 60 * 1000);
        }
        await this.save();
    };

    User.prototype.resetLoginAttempts = async function() {
        this.login_attempts = 0;
        this.locked_until = null;
        await this.save();
    };

    User.associate = (models) => {
        User.hasMany(models.RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    };

    return User;
};