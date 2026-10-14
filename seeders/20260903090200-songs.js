'use strict';

module.exports = {
    async up(queryInterface) {
        const now = new Date();

        await queryInterface.bulkInsert('songs', [
            {
                title: 'Bohemian Rhapsody',
                artist: 'Queen',
                genre: 'Rock',
                duration: 355,
                lyrics: 'Текст песни для караоке...',
                audioUrl: 'https://example.com/audio/bohemian-rhapsody.mp3',
                playsCount: 0,
                createdAt: now,
                updatedAt: now
            },
            {
                title: 'Shape of You',
                artist: 'Ed Sheeran',
                genre: 'Pop',
                duration: 233,
                lyrics: 'Текст песни для караоке...',
                audioUrl: 'https://example.com/audio/shape-of-you.mp3',
                playsCount: 0,
                createdAt: now,
                updatedAt: now
            },
            {
                title: 'Believer',
                artist: 'Imagine Dragons',
                genre: 'Rock',
                duration: 204,
                lyrics: 'Текст песни для караоке...',
                audioUrl: 'https://example.com/audio/believer.mp3',
                playsCount: 0,
                createdAt: now,
                updatedAt: now
            }
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('songs', null, {});
    }
};
