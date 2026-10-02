'use strict';

module.exports = (sequelize, DataTypes) => {
    const RequestLog = sequelize.define('RequestLog', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        method: { type: DataTypes.STRING(10), allowNull: false },
        url: { type: DataTypes.TEXT, allowNull: false },
        statusCode: { type: DataTypes.INTEGER, allowNull: true },
        durationMs: { type: DataTypes.INTEGER, allowNull: true },
        ip: { type: DataTypes.STRING(64), allowNull: true },
        userName: { type: DataTypes.STRING, allowNull: true }
    }, {
        tableName: 'request_logs'
    });

    return RequestLog;
};
