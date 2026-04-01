const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  try {
    await knex('messages').del();
    await knex('friends').del();
    await knex('achievements').del();
    await knex('users').del();

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('123456', salt);

    await knex('users').insert([
      { id: 1, username: 'admin', password: hashPassword, fullname: 'Quản Trị Viên', role: 'ADMIN' },
      { id: 2, username: 'duytruong', password: hashPassword, fullname: 'Đặng Nguyễn Duy Trường', role: 'USER' },
      { id: 3, username: 'anhtuan', password: hashPassword, fullname: 'Hoàng Anh Tuấn', role: 'USER' },
      { id: 4, username: 'quangvy', password: hashPassword, fullname: 'Nguyễn Quang Vỹ', role: 'USER' },
      { id: 5, username: 'giahuy', password: hashPassword, fullname: 'Trần Lê Gia Huy', role: 'USER' },
      { id: 6, username: 'quanghuy', password: hashPassword, fullname: 'Trần Quang Huy', role: 'USER' }
    ]);

    await knex('ratings').insert([
      { user_id: 2, game_id: 5, stars: 5, comment: 'Game rắn rất mượt và bánh cuốn!' },
      { user_id: 3, game_id: 5, stars: 4, comment: 'Cũng hay nhưng hơi khó chơi ở tốc độ cao.' },
      { user_id: 4, game_id: 1, stars: 5, comment: 'Tic-tac-toe chơi vui phết.' }
    ]);


    await knex('game_saves').insert([
      { user_id: 2, game_id: 5, board_state: JSON.stringify({}), score: 150, play_time_seconds: 120 },
      { user_id: 3, game_id: 5, board_state: JSON.stringify({}), score: 280, play_time_seconds: 300 },
      { user_id: 4, game_id: 5, board_state: JSON.stringify({}), score: 90, play_time_seconds: 60 }
    ]);

    await knex('friends').insert([
      { user_id: 2, friend_id: 3, status: 'ACCEPTED' },
      { user_id: 3, friend_id: 4, status: 'ACCEPTED' },
      { user_id: 5, friend_id: 6, status: 'PENDING' }
    ]);

await knex('achievements').insert([
      { user_id: 2, title: 'First Blood', description: 'Chiến thắng trận đầu tiên' },
      { user_id: 3, title: 'Snake Master', description: 'Đạt 200 điểm Rắn săn mồi' },
      { user_id: 4, title: 'Friendly', description: 'Kết bạn với 1 người' }
    ]);

    console.log("✅ File 02: Đã bơm toàn bộ User, Saves và Achievements thành công!");
  } catch (error) {
    console.error("❌ CÓ LỖI XẢY RA Ở FILE 02:", error.message);
  }
};