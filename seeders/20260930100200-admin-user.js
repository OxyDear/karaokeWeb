'use strict';

const bcrypt = require('bcrypt');

module.exports = {
    async up(queryInterface) {
        const email = (process.env.ADMIN_EMAIL || 'admin@karaoke.local').toLowerCase();
        const password = process.env.ADMIN_PASSWORD || 'admin12345';
        const passwordHash = await bcrypt.hash(password, 10);
        const now = new Date();

        // ON CONFLICT DO NOTHING — сид можно запускать повторно без ошибки
        // (sequelize-cli по умолчанию не запоминает, какие сиды уже выполнялись).
        await queryInterface.sequelize.query(
            `INSERT INTO users (email, "passwordHash", role, "createdAt", "updatedAt")
             VALUES (:email, :passwordHash, 'admin', :now, :now)
             ON CONFLICT (email) DO NOTHING`,
            { replacements: { email, passwordHash, now } }
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('users', { role: 'admin' }, {});
    }
};
