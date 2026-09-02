// "Модель" данных — временное хранение в массиве в памяти сервера.

let songs = [
  {
    id: 1,
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    genre: 'Rock',
    duration: 355, // секунды
    lyrics: 'Is this the real life? Is this just fantasy?...',
    audioUrl: 'https://example.com/audio/bohemian-rhapsody.mp3',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    genre: 'Pop',
    duration: 233,
    lyrics: 'The club isn`t the best place to find a lover...',
    audioUrl: 'https://example.com/audio/shape-of-you.mp3',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Believer',
    artist: 'Imagine Dragons',
    genre: 'Rock',
    duration: 204,
    lyrics: 'First things first, I\'ma say all the words inside my head...',
    audioUrl: 'https://example.com/audio/believer.mp3',
    createdAt: new Date().toISOString()
  }
];

let nextId = 4;

module.exports = {
  getAll: () => songs,

  getById: (id) => songs.find((s) => s.id === id),

  create: (data) => {
    const newSong = {
      id: nextId++,
      title: data.title,
      artist: data.artist,
      genre: data.genre || null,
      duration: data.duration ?? null,
      lyrics: data.lyrics,
      audioUrl: data.audioUrl,
      createdAt: new Date().toISOString()
    };
    songs.push(newSong);
    return newSong;
  },

  update: (id, data) => {
    const index = songs.findIndex((s) => s.id === id);
    if (index === -1) return null;
    songs[index] = { ...songs[index], ...data, id };
    return songs[index];
  },

  remove: (id) => {
    const index = songs.findIndex((s) => s.id === id);
    if (index === -1) return false;
    songs.splice(index, 1);
    return true;
  }
};
