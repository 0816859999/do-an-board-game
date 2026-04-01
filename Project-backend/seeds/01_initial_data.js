const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  try {
    // 1. Dọn dẹp nhà cửa
    await knex('messages').del();
    await knex('friends').del();
    await knex('achievements').del();
    await knex('ratings').del();
    await knex('game_saves').del();
    await knex('games').del();
    await knex('users').del();

    // 2. Bơm Trò chơi
    await knex('games').insert([
      { id: 1, name: 'TIC-TAC-TOE', is_active: true },
      { id: 2, name: 'CỜ CARO (5)', is_active: true },
      { id: 3, name: 'CỜ CARO (4)', is_active: true },
      { id: 4, name: 'BẢNG VẼ TỰ DO', is_active: true },
      { id: 5, name: 'RẮN SĂN MỒI', is_active: true },
      { id: 6, name: 'CỜ TRÍ NHỚ', is_active: true },
      { id: 7, name: 'GHÉP HÀNG 3', is_active: true }
    ]);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('123456', salt);

    // 3. Bơm Người dùng
    await knex('users').insert([
      { id: 1, username: 'admin', password: hashPassword, fullname: 'Quản Trị Viên', role: 'ADMIN' },
      { id: 2, username: 'nguoichoi1', password: hashPassword, fullname: 'Trần Văn A', role: 'USER' },
      { id: 3, username: 'nguoichoi2', password: hashPassword, fullname: 'Nguyễn Thị B', role: 'USER' },
      { id: 4, username: 'nguoichoi3', password: hashPassword, fullname: 'Lê Hoàng C', role: 'USER' }
    ]);

    // 4. Bơm Đánh giá
    await knex('ratings').insert([
      { user_id: 2, game_id: 5, stars: 5, comment: 'Game rắn rất mượt và bánh cuốn!' },
      { user_id: 3, game_id: 5, stars: 4, comment: 'Cũng hay nhưng hơi khó chơi ở tốc độ cao.' },
      { user_id: 4, game_id: 1, stars: 5, comment: 'Tic-tac-toe chơi vui phết.' }
    ]);

    // 5. Bơm Điểm số (FIX LỖI JSONB bằng cách truyền thẳng Object {})
    await knex('game_saves').insert([
      { user_id: 2, game_id: 5, board_state: JSON.stringify({}), score: 150, play_time_seconds: 120 },
      { user_id: 3, game_id: 5, board_state: JSON.stringify({}), score: 280, play_time_seconds: 300 },
      { user_id: 4, game_id: 5, board_state: JSON.stringify({}), score: 90, play_time_seconds: 60 }
    ]);

    console.log("✅ XUẤT SẮC! Đã bơm toàn bộ dữ liệu thành công 100%!");
  } catch (error) {
    console.error("❌ CÓ LỖI XẢY RA (hãy báo cho tôi dòng này):", error.message);
  }
};