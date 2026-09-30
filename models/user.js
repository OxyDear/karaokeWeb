'use strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        // Роль для RBAC (дополнительный механизм): 'user' или 'admin'
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user',
            validate: { isIn: [['user', 'admin']] }
        }
    }, {
        tableName: 'users'
    });

    User.ROLES = ['user', 'admin'];

    // Страховка: даже если где-то случайно сделать res.json(user),
    // хеш пароля в ответ не попадёт.
    User.prototype.toJSON = function () {
        const values = { ...this.get() };
        delete values.passwordHash;
        return values;
    };

    return User;
};
