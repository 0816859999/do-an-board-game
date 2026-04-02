exports.up = function(knex) {
  return knex.schema
    .dropTableIfExists('user_achievements')
    .dropTableIfExists('achievements')
    .createTable('achievements', table => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('description');
      table.string('icon_name');
    })
    .createTable('user_achievements', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('achievement_id').unsigned().references('id').inTable('achievements').onDelete('CASCADE');
      table.timestamp('unlocked_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_achievements').dropTableIfExists('achievements');
};