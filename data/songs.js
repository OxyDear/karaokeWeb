
const LYRICS_STUB = 'Текст песни для караоке...';

const songs = [
  {
    id: 1,
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    genre: 'Rock',
    duration: 356,
    lyrics: LYRICS_STUB,
    audioUrl: 'https://example.com/audio/sweet-child-o-mine.mp3',
    playsCount: 0
  },
  {
    id: 2,
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    genre: 'Pop',
    duration: 294,
    lyrics: LYRICS_STUB,
    audioUrl: 'https://example.com/audio/billie-jean.mp3',
    playsCount: 0
  },
  {
    id: 3,
    title: 'Hotel California',
    artist: 'Eagles',
    genre: 'Rock',
    duration: 391,
    lyrics: LYRICS_STUB,
    audioUrl: 'https://example.com/audio/hotel-california.mp3',
    playsCount: 0
  },
  {
    id: 4,
    title: 'Someone Like You',
    artist: 'Adele',
    genre: 'Ballad',
    duration: 285,
    lyrics: LYRICS_STUB,
    audioUrl: 'https://example.com/audio/someone-like-you.mp3',
    playsCount: 0
  },
  {
    id: 5,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    genre: 'Pop',
    duration: 200,
    lyrics: LYRICS_STUB,
    audioUrl: 'https://example.com/audio/blinding-lights.mp3',
    playsCount: 0
  },
  {
    id: 6,
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    genre: 'Rock',
    duration: 301,
    lyrics: LYRICS_STUB,
    audioUrl: 'https://example.com/audio/smells-like-teen-spirit.mp3',
    playsCount: 0
  },
  {
    id: 7,
    title: "Don't Stop Believin'",
    artist: 'Journey',
    genre: 'Rock',
    duration: 251,
    lyrics: LYRICS_STUB,
    audioUrl: 'https://example.com/audio/dont-stop-believin.mp3',
    playsCount: 0
  },
  {
    id: 8,
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    genre: 'Pop',
    duration: 270,
    lyrics: LYRICS_STUB,
    audioUrl: 'https://example.com/audio/uptown-funk.mp3',
    playsCount: 0
  }
];

let nextId = songs.length + 1;

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
