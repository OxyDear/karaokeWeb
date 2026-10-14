'use strict';

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

    remove: async (id) => {
        const song = await Song.findByPk(id);

        if (!song) {
            return false;
        }

        await song.destroy();
        return true;
    }
});
