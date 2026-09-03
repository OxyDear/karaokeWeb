const express = require('express');
const router = express.Router();
const controller = require('../controllers/playlists.controller');

router.get('/', controller.getAllPlaylists);
router.get('/:id', controller.getPlaylistById);
router.post('/', controller.createPlaylist);

module.exports = router;
