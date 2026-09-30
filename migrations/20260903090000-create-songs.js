'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('songs', {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
            title: { type: Sequelize.STRING, allowNull: false },
            artist: { type: Sequelize.STRING, allowNull: false },
            genre: { type: Sequelize.STRING, allowNull: true },
            duration: { type: Sequelize.INTEGER, allowNull: true },
            lyrics: { type: Sequelize.TEXT, allowNull: false },
            audioUrl: { type: Sequelize.STRING, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('songs');
    }
};
