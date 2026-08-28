const express = require('express');
const router = express.Router();
const controller = require('../controllers/songs.controller');

router.get('/', controller.getAllSongs);
router.get('/:id', controller.getSongById);
router.post('/', controller.createSong);
router.put('/:id', controller.updateSong);
router.delete('/:id', controller.deleteSong);

module.exports = router;
