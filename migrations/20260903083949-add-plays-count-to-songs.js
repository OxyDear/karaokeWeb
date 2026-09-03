'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем новое поле playsCount — счётчик исполнений песни в караоке
    await queryInterface.addColumn('Songs', 'playsCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Songs', 'playsCount');
  }
};
