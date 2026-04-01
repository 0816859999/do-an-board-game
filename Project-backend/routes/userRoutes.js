const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Khai báo các đường dẫn POST nhận dữ liệu từ Frontend gửi lên
router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;