const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const authMiddleware = require('../middleware/authMiddleware'); // Bắt buộc phải đăng nhập

// Tìm kiếm người dùng
router.get('/search', authMiddleware, socialController.searchUsers);

// Kết bạn
router.get('/friends', authMiddleware, socialController.getFriendsList);
router.post('/friends/request', authMiddleware, socialController.sendFriendRequest);
router.put('/friends/accept', authMiddleware, socialController.acceptFriendRequest);

// Tin nhắn
router.post('/messages', authMiddleware, socialController.sendMessage);
router.get('/messages/:friendId', authMiddleware, socialController.getMessages);

module.exports = router;