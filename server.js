const express = require('express');
const songsRouter = require('./routes/songs.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'Karaoke API работает',
    endpoints: {
      'GET /songs': 'получить список всех песен (можно фильтровать: ?artist=&genre=)',
      'GET /songs/:id': 'получить одну песню по ID',
      'POST /songs': 'добавить новую песню',
      'PUT /songs/:id': 'полностью обновить песню',
      'DELETE /songs/:id': 'удалить песню'
    }
  });
});

app.use('/songs', songsRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.originalUrl} не найден` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`Karaoke server запущен: http://localhost:${PORT}`);
});
