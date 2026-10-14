require('dotenv').config();

// Без секрета подписать/проверить JWT невозможно — лучше упасть сразу при старте,
// чем получить 500 при первом же входе.
if (!process.env.JWT_SECRET) {
    console.error('Не задана переменная окружения JWT_SECRET (добавьте её в .env)');
    process.exit(1);
}

const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const songModel = require('./models/song');
const createSongRepository = require('./models/songRepository');
const userModel = require('./models/user');
const createUserRepository = require('./models/userRepository');
const createAuthRouter = require('./routes/auth');
const createAdminRouter = require('./routes/admin');
const { authenticate, isAdmin } = require('./middleware/auth');
const asyncHandler = require('./middleware/asyncHandler');

const app = express();
const port = process.env.PORT || 3000;
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: process.env.DB_DIALECT || 'postgres'
});
const Song = songModel(sequelize, DataTypes);
const {
    findAll,
    findById,
    create,
    update,
    remove
} = createSongRepository(Song);
const User = userModel(sequelize, DataTypes);
const userRepository = createUserRepository(User);

app.use(express.json());

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

app.get('/songs', asyncHandler(async (req, res) => {
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

app.get('/songs/:id', asyncHandler(async (req, res) => {
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

app.post('/songs', authenticate, asyncHandler(async (req, res) => {
    const validationError = validateSong(req.body);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    res.status(201).json(await create(songData(req.body)));
}));

app.put('/songs/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
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

app.delete('/songs/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({ error: 'Некорректный ID песни' });
    }

    if (!await remove(id)) {
        return res.status(404).json({ error: 'Песня не найдена' });
    }

    res.status(204).send();
}));

// --- Аутентификация и авторизация ---

app.use('/auth', createAuthRouter(userRepository));

app.get('/profile', authenticate, asyncHandler(async (req, res) => {
    const user = await userRepository.findById(req.user.id);

    if (!user) {
        return res.status(401).json({ error: 'Пользователь не найден, войдите заново' });
    }

    res.json(user);
}));

app.use('/admin', authenticate, isAdmin, createAdminRouter(userRepository));

app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && error.body) {
        return res.status(400).json({ error: 'Некорректный JSON' });
    }

    next(error);
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
