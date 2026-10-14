const songsData = require('../data/songs');

// Небольшой хелпер: секунды -> "мм:сс" для удобного отображения в шаблонах
function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// GET / — главная страница со списком песен (с опциональным фильтром)
exports.renderIndex = (req, res) => {
  const { artist, genre } = req.query;
  const songs = songsData.getAll({ artist, genre }).map((s) => ({
    ...s,
    durationFormatted: formatDuration(s.duration)
  }));

  res.render('index', {
    title: 'Каталог песен — Онлайн-караоке',
    songs,
    genres: songsData.getAllGenres(),
    filters: { artist: artist || '', genre: genre || '' },
    user: req.user
  });
};

// GET /item/:id — детальная страница песни
exports.renderItem = (req, res, next) => {
  const id = Number(req.params.id);

  // Некорректный (не числовой) id — сознательно передаём ошибку дальше,
  // чтобы сработал error-handling middleware (демонстрация 500).
  if (Number.isNaN(id)) {
    return next(new Error(`Некорректный идентификатор песни: "${req.params.id}"`));
  }

  const song = songsData.getById(id);

  // Песни с таким id нет — это штатная ситуация "не найдено", а не ошибка сервера,
  // поэтому рендерим 404, а не бросаем исключение.
  if (!song) {
    return res.status(404).render('404', {
      title: 'Песня не найдена',
      url: req.originalUrl
    });
  }

  res.render('item', {
    title: `${song.title} — ${song.artist}`,
    song: { ...song, durationFormatted: formatDuration(song.duration) },
    user: req.user
  });
};

// GET /add — форма добавления новой песни
exports.renderAddForm = (req, res) => {
  res.render('add', {
    title: 'Добавить песню',
    user: req.user,
    errors: []
  });
};

// POST /add — обработка формы, добавление в массив, редирект на главную
exports.handleAddSong = (req, res) => {
  const { title, artist, genre, duration, lyrics, audioUrl } = req.body;

  const errors = [];
  if (!title || !title.trim()) errors.push('Поле "Название" обязательно');
  if (!artist || !artist.trim()) errors.push('Поле "Исполнитель" обязательно');
  if (duration && Number.isNaN(Number(duration))) {
    errors.push('Поле "Длительность" должно быть числом (в секундах)');
  }

  if (errors.length > 0) {
    return res.status(400).render('add', {
      title: 'Добавить песню',
      user: req.user,
      errors
    });
  }

  songsData.create({ title, artist, genre, duration, lyrics, audioUrl });
  res.redirect('/');
};
