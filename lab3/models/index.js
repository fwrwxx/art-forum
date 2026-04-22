const { sequelize } = require('../config/database');

const UserModel = require('./User')(sequelize);
const RefreshTokenModel = require('./RefreshToken')(sequelize);

const models = {
    User: UserModel,
    RefreshToken: RefreshTokenModel
};

Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

module.exports = { sequelize, ...models };