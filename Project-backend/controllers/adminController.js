const db = require('../db');

// Kiểm tra quyền (Chỉ Admin mới được thao tác)
const checkAdmin = (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: "Truy cập bị từ chối. Bạn không phải Admin!" });
  }
  return true;
};

// 1. API: Lấy số liệu thống kê tổng quan
exports.getStats = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;
    
    // Đếm tổng số lượng từ các bảng
    const usersCount = await db('users').count('id as total').first();
    const gamesCount = await db('games').count('id as total').first();
    const savesCount = await db('game_saves').count('id as total').first();
    const ratingsCount = await db('ratings').count('id as total').first();

    res.status(200).json({ 
      success: true, 
      data: {
        totalUsers: usersCount.total,
        totalGames: gamesCount.total,
        totalSaves: savesCount.total,
        totalRatings: ratingsCount.total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy thống kê" });
  }
};

// 2. API: Lấy danh sách tất cả người dùng
// 2. API: Lấy danh sách tất cả người dùng (Đã thêm Phân trang)
exports.getAllUsers = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;
    
    // Logic phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Đếm tổng số user để tính số trang
    const countResult = await db('users').count('id as total').first();
    const total = parseInt(countResult.total);

    const users = await db('users')
      .select('id', 'username', 'fullname', 'role', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
      
    res.status(200).json({ 
      success: true, 
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách người dùng" });
  }
};

// 3. API: Bật/Tắt trạng thái hoạt động của một Game
exports.toggleGameStatus = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;
    
    const { gameId } = req.params;
    const { is_active } = req.body; // true hoặc false

    await db('games').where({ id: gameId }).update({ is_active });
    res.status(200).json({ success: true, message: `Đã cập nhật trạng thái game ${gameId} thành ${is_active}` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật game" });
  }
};