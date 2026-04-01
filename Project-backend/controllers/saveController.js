const db = require('../db');

// API 1: LƯU GAME
exports.saveGame = async (req, res) => {
  try {
    const userId = req.user.id; // Thông tin này được trạm gác authMiddleware cung cấp
    const { game_id, board_state, score, play_time_seconds } = req.body;

    // Cất tiến độ chơi vào database
    const [newSave] = await db('game_saves').insert({
      user_id: userId,
      game_id,
      board_state: JSON.stringify(board_state), // Biến ma trận mảng thành chuỗi JSON để lưu
      score,
      play_time_seconds
    }).returning('*');

    res.status(201).json({ success: true, message: "Đã lưu game thành công!", data: newSave });
  } catch (error) {
    console.error("Lỗi khi lưu game:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi lưu game" });
  }
};
// API 2: TẢI DANH SÁCH GAME ĐÃ LƯU
exports.loadGames = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const countResult = await db('game_saves').where('user_id', userId).count('id as total').first();
    const total = parseInt(countResult.total);
    
    const saves = await db('game_saves')
      .join('games', 'game_saves.game_id', '=', 'games.id')
      .where('game_saves.user_id', userId)
      .select('game_saves.*', 'games.name as game_name')
      .orderBy('game_saves.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.status(200).json({ 
      success: true, 
      data: saves,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách game:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi tải game" });
  }
};