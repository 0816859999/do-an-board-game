const db = require('../db');

// --- 1. API ĐÁNH GIÁ GAME (RATING & COMMENT) ---
exports.addRating = async (req, res) => {
  try {
    const { game_id, stars, comment } = req.body;
    const user_id = req.user.id;

    // Kiểm tra xem user đã đánh giá game này chưa (nếu rồi thì Cập nhật, chưa thì Tạo mới)
    const existing = await db('ratings').where({ user_id, game_id }).first();
    if (existing) {
      await db('ratings').where({ id: existing.id }).update({ stars, comment, updated_at: db.fn.now() });
    } else {
      await db('ratings').insert({ user_id, game_id, stars, comment });
    }
    res.status(200).json({ success: true, message: "Đã lưu đánh giá của bạn!" });
  } catch (error) {
    console.error("Lỗi Rating:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi đánh giá" });
  }
};

exports.getRatings = async (req, res) => {
  try {
    const { gameId } = req.params;
    const ratings = await db('ratings')
      .join('users', 'ratings.user_id', '=', 'users.id')
      .where('game_id', gameId)
      .select('ratings.*', 'users.fullname', 'users.username')
      .orderBy('created_at', 'desc');
    res.status(200).json({ success: true, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// --- 2. API BẢNG XẾP HẠNG (RANKING) ---
exports.getRanking = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { filter } = req.query; // Nhận bộ lọc: global, personal, friends
    const user_id = req.user.id;

    let ranking = [];
    
    if (filter === 'personal') {
      // Chỉ cá nhân: Lấy các lần chơi điểm cao nhất của chính user này
      ranking = await db('game_saves')
        .where({ game_id: gameId, user_id })
        .select('score', 'play_time_seconds', 'created_at as date')
        .orderBy('score', 'desc')
        .limit(10);
    } else if (filter === 'friends') {
      // Chỉ bạn bè: Trả về rỗng (Sẽ code truy vấn DB khi làm xong module Quản lý kết bạn)
      ranking = []; 
    } else {
      // Toàn hệ thống: Nhóm theo user và lấy điểm cao nhất của mỗi người
      ranking = await db('game_saves')
        .join('users', 'game_saves.user_id', '=', 'users.id')
        .where('game_saves.game_id', gameId)
        .select('users.fullname as name', 'users.username')
        .max('game_saves.score as score')
        .groupBy('users.id', 'users.fullname', 'users.username')
        .orderBy('score', 'desc')
        .limit(10);
    }
    
    res.status(200).json({ success: true, data: ranking });
  } catch (error) {
    console.error("Lỗi Ranking:", error);
    res.status(500).json({ success: false });
  }
};