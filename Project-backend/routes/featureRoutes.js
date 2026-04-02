const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController');
const authMiddleware = require('../middleware/authMiddleware');

// Rating Routes
router.post('/rating', authMiddleware, featureController.addRating);
router.get('/rating/:gameId', featureController.getRatings);

// Ranking Route (Cần đăng nhập để lấy ID người dùng xử lý bộ lọc)
router.get('/ranking/:gameId', authMiddleware, featureController.getRanking);
//thành tựu
router.get('/achievements', authMiddleware, featureController.getUserAchievements);
module.exports = router;