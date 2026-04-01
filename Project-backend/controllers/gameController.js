const db = require('../db');

// API: Lấy danh sách tất cả trò chơi
exports.getAllGames = async (req, res) => {
  try {
    // Tương đương câu lệnh SQL: SELECT * FROM games
    const games = await db('games').select('*');
    
    res.status(200).json({
      success: true,
      data: games
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách game:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};