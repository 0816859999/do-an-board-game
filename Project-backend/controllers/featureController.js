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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Để limit nhỏ để dễ test phân trang
    const offset = (page - 1) * limit;

    const countResult = await db('ratings').where('game_id', gameId).count('id as total').first();
    const total = parseInt(countResult.total);

    const ratings = await db('ratings')
      .join('users', 'ratings.user_id', '=', 'users.id')
      .where('game_id', gameId)
      .select('ratings.*', 'users.fullname', 'users.username')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.status(200).json({ 
      success: true, 
      data: ratings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// --- 2. API BẢNG XẾP HẠNG (RANKING) ---
exports.getRanking = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { filter } = req.query; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const user_id = req.user.id;

    let ranking = [];
    
    if (filter === 'personal') {
      ranking = await db('game_saves')
        .where({ game_id: gameId, user_id })
        .select('score', 'play_time_seconds', 'created_at as date')
        .orderBy('score', 'desc')
        .limit(limit).offset(offset);
    } else if (filter === 'friends') {
      ranking = []; 
    } else {
      ranking = await db('game_saves')
        .join('users', 'game_saves.user_id', '=', 'users.id')
        .where('game_saves.game_id', gameId)
        .select('users.fullname as name', 'users.username')
        .max('game_saves.score as score')
        .groupBy('users.id', 'users.fullname', 'users.username')
        .orderBy('score', 'desc')
        .limit(limit).offset(offset);
    }
    
    // Ranking thường không cần trả về totalPages vì chỉ xem top đầu, nhưng có thể bổ sung nếu giảng viên yêu cầu gắt gao.
    res.status(200).json({ success: true, data: ranking, pagination: { page, limit } });
  } catch (error) {
    console.error("Lỗi Ranking:", error);
    res.status(500).json({ success: false });
  }
};

// --- 3. API THÀNH TỰU (ACHIEVEMENTS) ---
exports.getUserAchievements = async (req, res) => {
  try {
    const user_id = req.user.id;
    const achievements = await db('achievements')
      .leftJoin('user_achievements', function() {
        this.on('achievements.id', '=', 'user_achievements.achievement_id')
            .andOn('user_achievements.user_id', '=', db.raw('?', [user_id]))
      })
      .select('achievements.*', 'user_achievements.unlocked_at');
      
    res.status(200).json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy thành tựu" });
  }
};

exports.checkAndGrantAchievement = async (userId, gameId, score) => {
  try {
    if (gameId === 2 && score > 0) {
      const exists = await db('user_achievements').where({ user_id: userId, achievement_id: 1 }).first();
      if (!exists) await db('user_achievements').insert({ user_id: userId, achievement_id: 1 });
    }
    if (gameId === 5 && score >= 100) {
      const exists = await db('user_achievements').where({ user_id: userId, achievement_id: 2 }).first();
      if (!exists) await db('user_achievements').insert({ user_id: userId, achievement_id: 2 });
    }
  } catch (error) {
    console.error("Lỗi cấp thành tựu tự động:", error);
  }
};