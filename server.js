require('dotenv').config();

const express = require('express');
const { sequelize } = require('./models');
const songsRouter = require('./routes/songs.routes');
const playlistsRouter = require('./routes/playlists.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'Karaoke API работает (PostgreSQL + Sequelize)',
    endpoints: {
      'GET /songs': 'получить список всех песен (можно фильтровать: ?artist=&genre=, пагинация ?limit=&offset=)',
      'GET /songs/:id': 'получить одну песню по ID',
      'POST /songs': 'добавить новую песню',
      'PUT /songs/:id': 'полностью обновить песню',
      'DELETE /songs/:id': 'удалить песню',
      'GET /playlists': 'получить список плейлистов вместе с песнями',
      'GET /playlists/:id': 'получить один плейлист с песнями',
      'POST /playlists': 'создать новый плейлист'
    }
  });
});

app.use('/songs', songsRouter);
app.use('/playlists', playlistsRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.originalUrl} не найден` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Внутренняя ошибка сервера' });
});

// Проверяем подключение к базе данных перед стартом сервера
sequelize.authenticate()
  .then(() => {
    console.log('Подключение к PostgreSQL установлено успешно.');
    app.listen(PORT, () => {
      console.log(`Karaoke server запущен: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Не удалось подключиться к базе данных:', err.message);
    process.exit(1);
  });
