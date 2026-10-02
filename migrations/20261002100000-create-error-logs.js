'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('error_logs', {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
            statusCode: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 500 },
            message: { type: Sequelize.TEXT, allowNull: false },
            stack: { type: Sequelize.TEXT, allowNull: true },
            method: { type: Sequelize.STRING(10), allowNull: true },
            url: { type: Sequelize.TEXT, allowNull: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('error_logs');
    }
};
