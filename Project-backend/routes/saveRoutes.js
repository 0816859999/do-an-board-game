const express = require('express');
const router = express.Router();
const saveController = require('../controllers/saveController');
const authMiddleware = require('../middleware/authMiddleware');

// Áp dụng authMiddleware: Phải có vé (token) mới được vào Lưu/Tải game
router.post('/', authMiddleware, saveController.saveGame);
router.get('/', authMiddleware, saveController.loadGames);

module.exports = router;