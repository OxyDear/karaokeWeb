const { Song, Playlist } = require('/Users/oxydear/Library/CloudStorage/iCloudDrive-iCloudDrive(8.11.25)/com~apple~CloudDocs/Documents/Documents-IvansMacBookPro/IvansMac/IDEs/WebStorm/karaoke/models');

// Валидация данных песни на уровне контроллера (доп. к валидации Sequelize).
// isPartial=true допускает частичный набор полей.
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

// GET /songs — список всех песен, опционально фильтр по artist / genre,
// поддерживает пагинацию через ?limit=&offset=
exports.getAllSongs = async (req, res, next) => {
  try {
    const { artist, genre, limit, offset } = req.query;
    const { Op } = require('sequelize');
    const where = {};

    if (artist) {
      where.artist = { [Op.iLike]: `%${artist}%` };
    }
    if (genre) {
      where.genre = genre;
    }

    const queryOptions = {
      where,
      include: [{ model: Playlist, as: 'playlist', attributes: ['id', 'name'] }],
      order: [['id', 'ASC']]
    };

    if (limit) queryOptions.limit = Number(limit);
    if (offset) queryOptions.offset = Number(offset);

    const songs = await Song.findAll(queryOptions);
    res.status(200).json(songs);
  } catch (err) {
    next(err);
  }
};

// GET /songs/:id — одна песня по ID
exports.getSongById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID должен быть числом' });
    }

    const song = await Song.findByPk(id, {
      include: [{ model: Playlist, as: 'playlist', attributes: ['id', 'name'] }]
    });

    if (!song) {
      return res.status(404).json({ error: `Песня с id=${id} не найдена` });
    }

    res.status(200).json(song);
  } catch (err) {
    next(err);
  }
};

// POST /songs — создание новой песни
exports.createSong = async (req, res, next) => {
  try {
    const errors = validateSongData(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Некорректные данные запроса', details: errors });
    }

    const newSong = await Song.create(req.body);
    res.status(201).json(newSong);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Некорректные данные запроса',
        details: err.errors.map((e) => e.message)
      });
    }
    next(err);
  }
};

// PUT /songs/:id — полное обновление песни
exports.updateSong = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID должен быть числом' });
    }

    const errors = validateSongData(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Некорректные данные запроса', details: errors });
    }

    const song = await Song.findByPk(id);
    if (!song) {
      return res.status(404).json({ error: `Песня с id=${id} не найдена` });
    }

    await song.update(req.body);
    res.status(200).json(song);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Некорректные данные запроса',
        details: err.errors.map((e) => e.message)
      });
    }
    next(err);
  }
};

// DELETE /songs/:id — удаление песни
exports.deleteSong = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID должен быть числом' });
    }

    const deletedCount = await Song.destroy({ where: { id } });
    if (deletedCount === 0) {
      return res.status(404).json({ error: `Песня с id=${id} не найдена` });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
