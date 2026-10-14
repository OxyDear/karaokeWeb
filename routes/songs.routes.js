const express = require('express');
const router = express.Router();
const controller = require('../controllers/songs.controller');
const { requireAuth } = require('../middleware/fakeAuth');

// GET / → список элементов (главная)
router.get('/', controller.renderIndex);

// GET /item/:id → детальная страница элемента
router.get('/item/:id', controller.renderItem);

// GET /add → форма добавления (защищено имитацией авторизации:
// без ?auth=1 пользователь будет отправлен на /login)
router.get('/add', requireAuth, controller.renderAddForm);

// POST /add → добавление элемента в массив (тоже защищено)
router.post('/add', requireAuth, controller.handleAddSong);

// GET /login → страница-заглушка, объясняющая имитацию авторизации
router.get('/login', (req, res) => {
  res.render('login', { title: 'Вход' });
});

module.exports = router;
