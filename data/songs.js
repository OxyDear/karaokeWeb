// Данные хранятся в обычном массиве в оперативной памяти сервера.
// При перезапуске сервера массив пересоздаётся с начальными (seed) значениями.

let nextId = 6;

const songs = [
  {
    id: 1,
    title: 'Ночной эфир',
    artist: 'Городские огни',
    genre: 'Поп',
    duration: 214,
    lyrics:
      'Куплет 1:\nГород засыпает, зажигая фонари,\nМы поём мелодию до самой зари.\n\nПрипев:\nНочной эфир, только ты и я,\nМикрофон в руках — это жизнь моя.',
    audioUrl: '/audio/night-air-demo.mp3',
    playsCount: 128
  },
  {
    id: 2,
    title: 'Дорога домой',
    artist: 'Северный ветер',
    genre: 'Рок',
    duration: 187,
    lyrics:
      'Куплет 1:\nАсфальт под колёсами, огни вдоль дорог,\nЯ пел эту песню, чтобы кто-то помог.\n\nПрипев:\nДорога домой длиннее, чем кажется,\nНо голос звучит — и путь не теряется.',
    audioUrl: '/audio/road-home-demo.mp3',
    playsCount: 342
  },
  {
    id: 3,
    title: 'Летний дождь',
    artist: 'Аня Светлова',
    genre: 'Поп',
    duration: 201,
    lyrics:
      'Куплет 1:\nКапли стучат по крыше, лето в самом разгаре,\nМы поём под дождём, забыв о всяком угаре.\n\nПрипев:\nЛетний дождь смывает грусть без следа,\nПой со мной — и не будет беды.',
    audioUrl: '/audio/summer-rain-demo.mp3',
    playsCount: 97
  },
  {
    id: 4,
    title: 'Электрический пульс',
    artist: 'NEON WAVE',
    genre: 'Электро',
    duration: 176,
    lyrics:
      'Куплет 1:\nОгни танцпола, ритм внутри,\nМикрофон включён — держись, гори!\n\nПрипев:\nЭлектрический пульс качает зал,\nКаждый в этой песне — сам вокал.',
    audioUrl: '/audio/electric-pulse-demo.mp3',
    playsCount: 256
  },
  {
    id: 5,
    title: 'Тихая гавань',
    artist: 'Морской бриз',
    genre: 'Баллада',
    duration: 245,
    lyrics:
      'Куплет 1:\nВолны качают лодку у причала,\nПесня для тех, кто устал от начала.\n\nПрипев:\nТихая гавань, где можно спеть,\nГолос найдёт, куда лететь.',
    audioUrl: '/audio/quiet-harbor-demo.mp3',
    playsCount: 64
  }
];

function getAll({ artist, genre } = {}) {
  let result = songs;
  if (artist) {
    const q = artist.toLowerCase();
    result = result.filter((s) => s.artist.toLowerCase().includes(q));
  }
  if (genre) {
    result = result.filter((s) => s.genre.toLowerCase() === genre.toLowerCase());
  }
  return result;
}

function getById(id) {
  return songs.find((s) => s.id === Number(id));
}

function create({ title, artist, genre, duration, lyrics, audioUrl }) {
  const song = {
    id: nextId++,
    title: title.trim(),
    artist: artist.trim(),
    genre: (genre || 'Без жанра').trim(),
    duration: Number(duration) || 0,
    lyrics: (lyrics || '').trim(),
    audioUrl: (audioUrl || '').trim() || '/audio/no-track.mp3',
    playsCount: 0
  };
  songs.push(song);
  return song;
}

function getAllGenres() {
  return [...new Set(songs.map((s) => s.genre))];
}

module.exports = { getAll, getById, create, getAllGenres };
