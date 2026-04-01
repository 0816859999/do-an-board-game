const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Khai báo route GET /api/games
router.get('/', gameController.getAllGames);

module.exports = router;