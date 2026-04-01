/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Hàm UP: Dùng để TẠO bảng
  return knex.schema
    // 1. Tạo bảng Users (Người dùng)
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('password').notNullable();
      table.string('fullname');
      table.string('role').defaultTo('USER'); // Quyền: USER hoặc ADMIN
      table.timestamps(true, true);
    })
    // 2. Tạo bảng Games (Danh sách 7 trò chơi)
    .createTable('games', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    // 3. Tạo bảng Game_Saves (Lưu game, lưu điểm, thời gian)
    .createTable('game_saves', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('game_id').unsigned().references('id').inTable('games').onDelete('CASCADE');
      table.jsonb('board_state'); // Lưu nguyên cái ma trận màn hình vào đây
      table.integer('score').defaultTo(0);
      table.integer('play_time_seconds').defaultTo(0);
      table.timestamps(true, true);
    })
    // 4. Tạo bảng Ratings (Đánh giá game)
    .createTable('ratings', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('game_id').unsigned().references('id').inTable('games').onDelete('CASCADE');
      table.integer('stars').notNullable();
      table.text('comment');
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Hàm DOWN: Dùng để XÓA bảng (nếu muốn rollback)
  return knex.schema
    .dropTableIfExists('ratings')
    .dropTableIfExists('game_saves')
    .dropTableIfExists('games')
    .dropTableIfExists('users');
};