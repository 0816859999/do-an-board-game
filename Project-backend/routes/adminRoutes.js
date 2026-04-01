const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware'); // Bắt buộc phải có token

// Áp dụng authMiddleware để biết ai đang gọi API, sau đó Controller sẽ tự check Role
router.get('/stats', authMiddleware, adminController.getStats);
router.get('/users', authMiddleware, adminController.getAllUsers);
router.put('/games/:gameId', authMiddleware, adminController.toggleGameStatus);

module.exports = router;