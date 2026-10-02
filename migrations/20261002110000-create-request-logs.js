'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('request_logs', {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
            method: { type: Sequelize.STRING(10), allowNull: false },
            url: { type: Sequelize.TEXT, allowNull: false },
            statusCode: { type: Sequelize.INTEGER, allowNull: true },
            durationMs: { type: Sequelize.INTEGER, allowNull: true },
            ip: { type: Sequelize.STRING(64), allowNull: true },
            userName: { type: Sequelize.STRING, allowNull: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('request_logs');
    }
};
