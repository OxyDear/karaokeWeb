'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Сначала создаём плейлист, чтобы продемонстрировать связь один-ко-многим
    const [playlist] = await queryInterface.bulkInsert(
      'Playlists',
      [{
        name: 'Рок-хиты',
        description: 'Популярные рок-композиции для караоке',
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      { returning: true }
    );

    const playlistId = playlist ? playlist.id : null;

    await queryInterface.bulkInsert('Songs', [
      {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        genre: 'Rock',
        duration: 355,
        lyrics: 'Is this the real life? Is this just fantasy?...',
        audioUrl: 'https://example.com/audio/bohemian-rhapsody.mp3',
        playlistId: playlistId,
        playsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Shape of You',
        artist: 'Ed Sheeran',
        genre: 'Pop',
        duration: 233,
        lyrics: "The club isn't the best place to find a lover...",
        audioUrl: 'https://example.com/audio/shape-of-you.mp3',
        playlistId: null,
        playsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Believer',
        artist: 'Imagine Dragons',
        genre: 'Rock',
        duration: 204,
        lyrics: "First things first, I'ma say all the words inside my head...",
        audioUrl: 'https://example.com/audio/believer.mp3',
        playlistId: playlistId,
        playsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Songs', null, {});
    await queryInterface.bulkDelete('Playlists', null, {});
  }
};
