require('dotenv').config();

// Без секрета подписать/проверить JWT невозможно — лучше упасть сразу при старте,
// чем получить 500 при первом же входе.
if (!process.env.JWT_SECRET) {
    console.error('Не задана переменная окружения JWT_SECRET (добавьте её в .env)');
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const Song = require('./models/song');
const User = require('./models/user');
const createSongRepository = require('./models/songRepository');
const createUserRepository = require('./models/userRepository');
const createAuthRouter = require('./routes/auth');
const createAdminRouter = require('./routes/admin');
const { authenticate, isAdmin } = require('./middleware/auth');
const asyncHandler = require('./middleware/asyncHandler');
const { parseObjectId } = require('./utils/objectId');

const app = express();
const port = process.env.PORT || 3000;

const {
    findAll,
    findById,
    create,
    update,
    remove,
    findGenres,
    findTags,
    incrementPlays,
    addReview,
    updateReview,
    likeReview,
    removeReview
} = createSongRepository(Song);
const userRepository = createUserRepository(User);

// CORS: React-клиент (Vite, :5173) живёт на другом origin, чем API (:3000).
// CORS_ORIGIN — список разрешённых origin через запятую; если не задан, разрешены все.
const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use(cors(corsOrigins.length ? { origin: corsOrigins } : undefined));

app.use(express.json());

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

    if (data.tags !== undefined) {
        if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== 'string')) {
            return 'Поле tags должно быть массивом строк';
        }

        if (data.tags.length > 10) {
            return 'В поле tags не более 10 элементов';
        }
    }

    return null;
};

const songData = (data) => {
    const result = {
        title: data.title.trim(),
        artist: data.artist.trim(),
        genre: typeof data.genre === 'string' ? data.genre.trim() : null,
        duration: data.duration ?? null,
        lyrics: data.lyrics.trim(),
        audioUrl: data.audioUrl.trim()
    };

    // Теги меняем только если они пришли в запросе — иначе PUT от клиента, который
    // про теги не знает, стёр бы их.
    if (data.tags !== undefined) {
        result.tags = [...new Set(data.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
    }

    return result;
};

const validateReview = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return 'Тело запроса должно быть объектом';
    }

    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
        return 'Поле rating обязательно и должно быть целым числом от 1 до 5';
    }

    if (data.comment !== undefined && (typeof data.comment !== 'string' || data.comment.length > 1000)) {
        return 'Поле comment должно быть строкой не длиннее 1000 символов';
    }

    return null;
};

// ---------- Песни: CRUD ----------

app.get('/songs', asyncHandler(async (req, res) => {
    const { artist, genre, search, tag } = req.query;
    const filter = {};

    if (typeof artist === 'string' && artist.trim()) {
        filter.artist = { $regex: escapeRegex(artist.trim()), $options: 'i' };
    }

    if (typeof genre === 'string' && genre) {
        filter.genre = genre;
    }

    // Поиск для React-клиента: подстрока в названии ИЛИ исполнителе (без учёта регистра)
    if (typeof search === 'string' && search.trim()) {
        const pattern = { $regex: escapeRegex(search.trim()), $options: 'i' };
        filter.$or = [{ title: pattern }, { artist: pattern }];
    }

    // «Массив содержит значение»: { tags: 'рок' } находит документы, где в tags есть 'рок'
    if (typeof tag === 'string' && tag.trim()) {
        filter.tags = tag.trim().toLowerCase();
    }

    res.json(await findAll(filter));
}));

// Списки для фильтров. Объявлены ДО '/songs/:id', иначе "genres" попадёт в :id.
app.get('/songs/genres', asyncHandler(async (req, res) => {
    res.json(await findGenres());
}));

app.get('/songs/tags', asyncHandler(async (req, res) => {
    res.json(await findTags());
}));

app.get('/songs/:id', asyncHandler(async (req, res) => {
    const id = parseObjectId(req.params.id);

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
    const id = parseObjectId(req.params.id);

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

// «Спеть песню»: атомарно увеличивает счётчик исполнений. Доступно любому
// авторизованному пользователю (в отличие от PUT/DELETE, которые только для admin).
app.post('/songs/:id/play', authenticate, asyncHandler(async (req, res) => {
    const id = parseObjectId(req.params.id);

    if (id === null) {
        return res.status(400).json({ error: 'Некорректный ID песни' });
    }

    const song = await incrementPlays(id);

    if (!song) {
        return res.status(404).json({ error: 'Песня не найдена' });
    }

    res.json(song);
}));

// Возвращает удалённый документ. Отзывы лежат внутри песни, поэтому «каскадно»
// удаляются вместе с ней — отдельной коллекции с дочерними документами нет.
app.delete('/songs/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
    const id = parseObjectId(req.params.id);

    if (id === null) {
        return res.status(400).json({ error: 'Некорректный ID песни' });
    }

    const deleted = await remove(id);

    if (!deleted) {
        return res.status(404).json({ error: 'Песня не найдена' });
    }

    res.json({ message: 'Песня удалена', song: deleted });
}));

// ---------- Отзывы: вложенный массив reviews внутри песни ----------

// Достаёт песню и (если указан) отзыв по id; при ошибке сама отвечает клиенту и возвращает null
const loadReviewContext = async (req, res, withReview) => {
    const songId = parseObjectId(req.params.id);
    const reviewId = withReview ? parseObjectId(req.params.reviewId) : true;

    if (songId === null || reviewId === null) {
        res.status(400).json({ error: 'Некорректный ID песни или отзыва' });
        return null;
    }

    const song = await findById(songId);

    if (!song) {
        res.status(404).json({ error: 'Песня не найдена' });
        return null;
    }

    const review = withReview ? song.reviews.id(reviewId) : null;

    if (withReview && !review) {
        res.status(404).json({ error: 'Отзыв не найден' });
        return null;
    }

    return { songId, reviewId, song, review };
};

// Менять/удалять отзыв может его автор или админ
const canModifyReview = (user, review) => user.role === 'admin' || review.userId === String(user.id);

app.get('/songs/:id/reviews', asyncHandler(async (req, res) => {
    const context = await loadReviewContext(req, res, false);

    if (context) {
        res.json(context.song.reviews);
    }
}));

// POST /songs/:id/reviews — добавить отзыв ($push). Тело: { "rating": 5, "comment": "..." }
app.post('/songs/:id/reviews', authenticate, asyncHandler(async (req, res) => {
    const context = await loadReviewContext(req, res, false);

    if (!context) {
        return;
    }

    const validationError = validateReview(req.body);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const song = await addReview(context.songId, {
        userId: String(req.user.id),
        userEmail: req.user.email,
        rating: req.body.rating,
        comment: req.body.comment || ''
    });

    res.status(201).json(song);
}));

// PUT /songs/:id/reviews/:reviewId — изменить отзыв (позиционный оператор $)
app.put('/songs/:id/reviews/:reviewId', authenticate, asyncHandler(async (req, res) => {
    const context = await loadReviewContext(req, res, true);

    if (!context) {
        return;
    }

    if (!canModifyReview(req.user, context.review)) {
        return res.status(403).json({ error: 'Изменять отзыв может только его автор или admin' });
    }

    const validationError = validateReview(req.body);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const song = await updateReview(context.songId, context.reviewId, {
        rating: req.body.rating,
        comment: req.body.comment ?? context.review.comment
    });

    res.json(song);
}));

// POST /songs/:id/reviews/:reviewId/like — +1 к счётчику внутри элемента массива ($inc + $)
app.post('/songs/:id/reviews/:reviewId/like', authenticate, asyncHandler(async (req, res) => {
    const context = await loadReviewContext(req, res, true);

    if (!context) {
        return;
    }

    res.json(await likeReview(context.songId, context.reviewId));
}));

// DELETE /songs/:id/reviews/:reviewId — удалить отзыв из массива ($pull)
app.delete('/songs/:id/reviews/:reviewId', authenticate, asyncHandler(async (req, res) => {
    const context = await loadReviewContext(req, res, true);

    if (!context) {
        return;
    }

    if (!canModifyReview(req.user, context.review)) {
        return res.status(403).json({ error: 'Удалять отзыв может только его автор или admin' });
    }

    res.json(await removeReview(context.songId, context.reviewId));
}));

// ---------- Аутентификация и авторизация ----------

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

// Ошибки Mongoose: не прошла валидация схемы / не удалось привести значение к типу поля
app.use((error, req, res, next) => {
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors).map((e) => e.message).join('; ');
        return res.status(400).json({ error: message });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({ error: `Некорректное значение поля ${error.path}` });
    }

    next(error);
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Сначала подключаемся к MongoDB, и только потом начинаем принимать запросы
connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Не удалось подключиться к MongoDB:', error.message);
        process.exit(1);
    });
