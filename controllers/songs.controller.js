const Song = require('../models/songs.model');

// Валидация данных песни. isPartial=true допускает частичный набор полей
// (например, для PUT можно потребовать все поля, но здесь для гибкости
// проверяем только те, что переданы, плюс обязательный набор при создании).
function validateSongData(data, isPartial = false) {
  const errors = [];
  const requiredFields = ['title', 'artist', 'lyrics', 'audioUrl'];

  if (!isPartial) {
    requiredFields.forEach((field) => {
      if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
        errors.push(`Поле "${field}" обязательно и должно быть непустой строкой`);
      }
    });
  } else {
    requiredFields.forEach((field) => {
      if (field in data && (typeof data[field] !== 'string' || data[field].trim() === '')) {
        errors.push(`Поле "${field}" должно быть непустой строкой`);
      }
    });
  }

  if ('duration' in data && data.duration !== null && typeof data.duration !== 'number') {
    errors.push('Поле "duration" должно быть числом (длительность в секундах)');
  }

  return errors;
}

// GET /songs  — список всех песен, опционально фильтр по artist / genre
exports.getAllSongs = (req, res) => {
  let result = Song.getAll();
  const { artist, genre } = req.query;

  if (artist) {
    result = result.filter((s) => s.artist.toLowerCase().includes(String(artist).toLowerCase()));
  }
  if (genre) {
    result = result.filter((s) => s.genre && s.genre.toLowerCase() === String(genre).toLowerCase());
  }

  res.status(200).json(result);
};

// GET /songs/:id — одна песня по ID
exports.getSongById = (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID должен быть числом' });
  }

  const song = Song.getById(id);
  if (!song) {
    return res.status(404).json({ error: `Песня с id=${id} не найдена` });
  }

  res.status(200).json(song);
};

// POST /songs — создание новой песни
exports.createSong = (req, res) => {
  const errors = validateSongData(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Некорректные данные запроса', details: errors });
  }

  const newSong = Song.create(req.body);
  res.status(201).json(newSong);
};

// PUT /songs/:id — полное обновление песни
exports.updateSong = (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID должен быть числом' });
  }

  const errors = validateSongData(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Некорректные данные запроса', details: errors });
  }

  const updated = Song.update(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: `Песня с id=${id} не найдена` });
  }

  res.status(200).json(updated);
};

// DELETE /songs/:id — удаление песни
exports.deleteSong = (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID должен быть числом' });
  }

  const success = Song.remove(id);
  if (!success) {
    return res.status(404).json({ error: `Песня с id=${id} не найдена` });
  }

  res.status(204).send();
};
