exports.seed = async function(knex) {
  await knex('user_achievements').del();
  await knex('achievements').del();
  
  await knex('achievements').insert([
    { id: 1, title: 'Cao thủ Caro', description: 'Thắng 10 ván Caro', icon_name: 'Award' },
    { id: 2, title: 'Vua Rắn', description: 'Đạt 1000 điểm Rắn săn mồi', icon_name: 'Award' }
  ]);
};