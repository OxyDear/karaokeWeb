const { Playlist, Song } = require('/Users/oxydear/Library/CloudStorage/iCloudDrive-iCloudDrive(8.11.25)/com~apple~CloudDocs/Documents/Documents-IvansMacBookPro/IvansMac/IDEs/WebStorm/karaoke/models');

// GET /playlists — список плейлистов вместе с песнями, которые в них входят
// (демонстрация связи один-ко-многим между Playlist и Song)
exports.getAllPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.findAll({
      include: [{ model: Song, as: 'songs', attributes: ['id', 'title', 'artist'] }],
      order: [['id', 'ASC']]
    });
    res.status(200).json(playlists);
  } catch (err) {
    next(err);
  }
};

// GET /playlists/:id — один плейлист с песнями
exports.getPlaylistById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID должен быть числом' });
    }

    const playlist = await Playlist.findByPk(id, {
      include: [{ model: Song, as: 'songs' }]
    });

    if (!playlist) {
      return res.status(404).json({ error: `Плейлист с id=${id} не найден` });
    }

    res.status(200).json(playlist);
  } catch (err) {
    next(err);
  }
};

// POST /playlists — создание плейлиста
exports.createPlaylist = async (req, res, next) => {
  try {
    if (!req.body.name || typeof req.body.name !== 'string' || !req.body.name.trim()) {
      return res.status(400).json({ error: 'Поле "name" обязательно и должно быть непустой строкой' });
    }
    const playlist = await Playlist.create(req.body);
    res.status(201).json(playlist);
  } catch (err) {
    next(err);
  }
};
