const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'DO_AN_BOARD_GAME_SECRET_KEY';

module.exports = (req, res, next) => {
  // 1. Lấy token từ header của request do Frontend gửi lên
  const token = req.header('Authorization');

  // 2. Nếu không có token -> Đuổi về
  if (!token) {
    return res.status(401).json({ success: false, message: "Từ chối truy cập. Bạn chưa đăng nhập!" });
  }

  try {
    // 3. Giải mã token để xem đây là user nào
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded; // Gắn thông tin user vào request để dùng cho bước sau
    next(); // Cho phép đi tiếp vào Controller
  } catch (error) {
    res.status(400).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};