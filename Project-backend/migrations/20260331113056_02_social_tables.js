/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // 1. Tạo bảng Bạn bè (Lưu ai kết bạn với ai, trạng thái chờ hay đã chấp nhận)
    .createTable('friends', table => {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.integer('friend_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('status').defaultTo('pending'); // 'pending' (đang chờ), 'accepted' (đã kết bạn)
      table.timestamps(true, true);
    })
    // 2. Tạo bảng Tin nhắn
    .createTable('messages', table => {
      table.increments('id').primary();
      table.integer('sender_id').references('id').inTable('users').onDelete('CASCADE');
      table.integer('receiver_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('content').notNullable();
      table.timestamps(true, true);
    })
    // 3. Tạo bảng Thành tựu
    .createTable('achievements', table => {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('title').notNullable(); // Tên thành tựu (VD: "Cao thủ Caro")
      table.string('description');
      table.timestamp('unlocked_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('achievements')
    .dropTableIfExists('messages')
    .dropTableIfExists('friends');
};