require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { Sequelize, DataTypes, Op } = require('sequelize');
const path = require('path');
const songModel = require('./models/song');
const errorLogModel = require('./models/errorLog');
const requestLogModel = require('./models/requestLog');
const createSongRepository = require('./models/songRepository');
const createRequestLogger = require('./middleware/logger');
const { identifyUser } = require('./middleware/auth');
const { createNotFoundHandler, createServerErrorHandler } = require('./middleware/errorHandlers');
const songsRoutes = require('./routes/songs.routes');

const app = express();
const port = process.env.PORT || 3000;
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: process.env.DB_DIALECT || 'postgres'
});
const Song = songModel(sequelize, DataTypes);
const ErrorLog = errorLogModel(sequelize, DataTypes);
const RequestLog = requestLogModel(sequelize, DataTypes);
const {
    findAll,
    findById,
    create,
    update,
    remove
} = createSongRepository(Song);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(identifyUser);
app.use(createRequestLogger(RequestLog));

app.use('/', songsRoutes);

// Express 4 не передаёт ошибки из async-обработчиков в error-handling middleware,
// поэтому оборачиваем их: отклонённый промис -> next(err) -> запись в БД + ответ 500.
const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const parseId = (value) => {
    const id = Number(value);

    if (!Number.isInteger(id) || id < 1) {
        return null;
    }

    return id;
};

const validateSong = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return 'Тело запроса должно быть объектом';
    }

    if (typeof data.title !== 'string' || data.title.trim() === '') {
        return 'Поле title обязательно и должно быть непустой строкой';
    }

    if (typeof data.artist !== 'string' || data.artist.trim() === '') {
        return 'Поле artist обязательно и должно быть непустой строкой';
    }

    if (typeof data.lyrics !== 'string' || data.lyrics.trim() === '') {
        return 'Поле lyrics обязательно и должно быть непустой строкой';
    }

    if (typeof data.audioUrl !== 'string' || data.audioUrl.trim() === '') {
        return 'Поле audioUrl обязательно и должно быть непустой строкой';
    }

    if (data.duration !== undefined && data.duration !== null && typeof data.duration !== 'number') {
        return 'Поле duration должно быть числом';
    }

    return null;
};

const songData = (data) => ({
    title: data.title.trim(),
    artist: data.artist.trim(),
    genre: typeof data.genre === 'string' ? data.genre.trim() : null,
    duration: data.duration ?? null,
    lyrics: data.lyrics.trim(),
    audioUrl: data.audioUrl.trim()
});

app.get('/songs', wrap(async (req, res) => {
    const { artist, genre } = req.query;
    const where = {};

    if (artist) {
        where.artist = { [Op.iLike]: `%${artist}%` };
    }

    if (genre) {
        where.genre = genre;
    }

    res.json(await findAll(where));
}));

app.get('/songs/:id', wrap(async (req, res) => {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({ error: 'Некорректный ID песни' });
    }

    const song = await findById(id);

    if (!song) {
        return res.status(404).json({ error: 'Песня не найдена' });
    }

    res.json(song);
}));

app.post('/songs', wrap(async (req, res) => {
    const validationError = validateSong(req.body);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    res.status(201).json(await create(songData(req.body)));
}));

app.put('/songs/:id', wrap(async (req, res) => {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({ error: 'Некорректный ID песни' });
    }

    const validationError = validateSong(req.body);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const song = await update(id, songData(req.body));

    if (!song) {
        return res.status(404).json({ error: 'Песня не найдена' });
    }

    res.json(song);
}));

app.delete('/songs/:id', wrap(async (req, res) => {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({ error: 'Некорректный ID песни' });
    }

    if (!await remove(id)) {
        return res.status(404).json({ error: 'Песня не найдена' });
    }

    res.status(204).send();
}));

app.use(createNotFoundHandler(ErrorLog));

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && error.body) {
        return res.status(400).json({ error: 'Некорректный JSON' });
    }

    next(error);
});

app.use(createServerErrorHandler(ErrorLog));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
