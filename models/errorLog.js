'use strict';

module.exports = (sequelize, DataTypes) => {
    const ErrorLog = sequelize.define('ErrorLog', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        statusCode: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 500 },
        message: { type: DataTypes.TEXT, allowNull: false },
        stack: { type: DataTypes.TEXT, allowNull: true },
        method: { type: DataTypes.STRING(10), allowNull: true },
        url: { type: DataTypes.TEXT, allowNull: true }
    }, {
        tableName: 'error_logs'
    });

    return ErrorLog;
};
