const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RefreshToken = sequelize.define('RefreshToken', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        is_revoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'refresh_tokens',
        timestamps: true,
        underscored: true
    });

    RefreshToken.associate = (models) => {
        RefreshToken.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return RefreshToken;
};