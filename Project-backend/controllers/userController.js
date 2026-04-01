const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// BẢO MẬT: Chuỗi bí mật dùng để tạo Token (Thực tế nên để trong file .env)
const JWT_SECRET = process.env.JWT_SECRET || 'DO_AN_BOARD_GAME_SECRET_KEY';

// 1. API ĐĂNG KÝ TÀI KHOẢN
exports.register = async (req, res) => {
  try {
    const { username, password, fullname } = req.body;

    // Kiểm tra xem tên đăng nhập đã bị ai dùng chưa
    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại!" });
    }

    // Băm (Hash) mật khẩu trước khi lưu vào Database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Lưu người dùng mới vào bảng users
    const [newUser] = await db('users').insert({
      username,
      password: hashedPassword,
      fullname
    }).returning(['id', 'username', 'fullname', 'role']);

    res.status(201).json({ 
      success: true, 
      message: "Đăng ký thành công!", 
      user: newUser 
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi đăng ký" });
  }
};

// 2. API ĐĂNG NHẬP
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm người dùng trong Database
    const user = await db('users').where({ username }).first();
    if (!user) {
      return res.status(400).json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" });
    }

    // So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" });
    }

    // Tạo thẻ thông hành JWT Token (hết hạn sau 1 ngày)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      success: true, 
      message: "Đăng nhập thành công!", 
      token, 
      user: { id: user.id, username: user.username, fullname: user.fullname, role: user.role } 
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi đăng nhập" });
  }
};