const express = require('express');
const router = express.Router();
const controller = require('../controllers/songs.controller');

router.get('/', controller.renderIndex);
router.get('/item/:id', controller.renderItem);
router.get('/add', controller.renderAddForm);
router.post('/add', controller.handleAddSong);

router.get('/login', (req, res) => {
  res.render('login', { title: 'Вход' });
});

module.exports = router;
