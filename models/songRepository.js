'use strict';

const { fn, col } = require('sequelize');

module.exports = (Song) => ({
    findAll: (where = {}) => Song.findAll({ where, order: [['id', 'ASC']] }),

    findById: (id) => Song.findByPk(id),

    create: (data) => Song.create(data),

    update: async (id, data) => {
        const song = await Song.findByPk(id);

        if (!song) {
            return null;
        }

        return song.update(data);
    },

    // Уникальные непустые жанры (для выпадающего списка фильтра)
    findGenres: async () => {
        const rows = await Song.findAll({
            attributes: [[fn('DISTINCT', col('genre')), 'genre']],
            raw: true
        });

        return rows
            .map((row) => row.genre)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'ru'));
    },

    // Атомарный инкремент playsCount (UPDATE ... SET playsCount = playsCount + 1)
    incrementPlays: async (id) => {
        const song = await Song.findByPk(id);

        if (!song) {
            return null;
        }

        await song.increment('playsCount');
        return song.reload();
    },

    remove: async (id) => {
        const song = await Song.findByPk(id);

        if (!song) {
            return false;
        }

        await song.destroy();
        return true;
    }
});
