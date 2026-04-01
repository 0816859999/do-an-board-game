const db = require('../db');

// 1. TÌM KIẾM NGƯỜI DÙNG
exports.searchUsers = async (req, res) => {
  try {
    const { keyword } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!keyword) return res.status(400).json({ success: false, message: "Vui lòng nhập từ khóa tìm kiếm" });

    const users = await db('users')
      .where('username', 'ilike', `%${keyword}%`)
      .orWhere('fullname', 'ilike', `%${keyword}%`)
      .select('id', 'username', 'fullname')
      .limit(limit)
      .offset(offset);

    res.status(200).json({ success: true, data: users, pagination: { page, limit } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi tìm kiếm người dùng" });
  }
};

// 2. GỬI LỜI MỜI KẾT BẠN
exports.sendFriendRequest = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { friend_id } = req.body;

    if (user_id === friend_id) return res.status(400).json({ success: false, message: "Không thể tự kết bạn với chính mình!" });

    // Kiểm tra xem đã kết bạn hoặc gửi lời mời chưa
    const existing = await db('friends')
      .where({ user_id, friend_id })
      .orWhere({ user_id: friend_id, friend_id: user_id })
      .first();

    if (existing) {
      return res.status(400).json({ success: false, message: "Đã gửi lời mời hoặc đã là bạn bè!" });
    }

    await db('friends').insert({ user_id, friend_id, status: 'pending' });
    res.status(201).json({ success: true, message: "Đã gửi lời mời kết bạn!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi gửi lời mời" });
  }
};

// 3. CHẤP NHẬN KẾT BẠN
exports.acceptFriendRequest = async (req, res) => {
  try {
    const user_id = req.user.id; // Người nhận lời mời
    const { friend_id } = req.body; // Người gửi lời mời

    await db('friends')
      .where({ user_id: friend_id, friend_id: user_id, status: 'pending' })
      .update({ status: 'accepted' });

    res.status(200).json({ success: true, message: "Đã chấp nhận kết bạn!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi chấp nhận kết bạn" });
  }
};

// 4. LẤY DANH SÁCH BẠN BÈ & LỜI MỜI
exports.getFriendsList = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Lấy những người mình gửi lời mời (chờ người ta đồng ý) hoặc đã là bạn
    const myRequests = await db('friends')
      .join('users', 'friends.friend_id', '=', 'users.id')
      .where('friends.user_id', user_id)
      .select('friends.id as relationship_id', 'friends.status', 'users.id', 'users.username', 'users.fullname', db.raw("'sent' as type"));

    // Lấy những người gửi lời mời cho mình (mình chờ đồng ý) hoặc đã là bạn
    const requestsToMe = await db('friends')
      .join('users', 'friends.user_id', '=', 'users.id')
      .where('friends.friend_id', user_id)
      .select('friends.id as relationship_id', 'friends.status', 'users.id', 'users.username', 'users.fullname', db.raw("'received' as type"));

    res.status(200).json({ success: true, data: [...myRequests, ...requestsToMe] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách bạn bè" });
  }
};

// 5. GỬI VÀ NHẬN TIN NHẮN
exports.sendMessage = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id, content } = req.body;

    await db('messages').insert({ sender_id, receiver_id, content });
    res.status(201).json({ success: true, message: "Đã gửi tin nhắn" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi gửi tin nhắn" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const user1 = req.user.id;
    const user2 = req.params.friendId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Tin nhắn nên lấy nhiều hơn mỗi trang
    const offset = (page - 1) * limit;

    const messages = await db('messages')
      .where(function() { this.where('sender_id', user1).andWhere('receiver_id', user2) })
      .orWhere(function() { this.where('sender_id', user2).andWhere('receiver_id', user1) })
      .orderBy('created_at', 'desc') // Sửa thành desc để lấy tin nhắn mới nhất trước
      .limit(limit)
      .offset(offset);

    // Đảo ngược lại mảng để hiển thị từ trên xuống dưới cho đúng giao diện chat
    res.status(200).json({ success: true, data: messages.reverse(), pagination: { page, limit } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy tin nhắn" });
  }
};