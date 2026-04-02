/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Xóa toàn bộ dữ liệu cũ trong bảng games (nếu có)
  await knex('games').del();
  
  // Bơm 7 game chuẩn theo frontend vào
  await knex('games').insert([
    { id: 1, name: 'TIC-TAC-TOE', is_active: true },
    { id: 2, name: 'CỜ CARO (5)', is_active: true },
    { id: 3, name: 'CỜ CARO (4)', is_active: true },
    { id: 4, name: 'BẢNG VẼ TỰ DO', is_active: true },
    { id: 5, name: 'RẮN SĂN MỒI', is_active: true },
    { id: 6, name: 'CỜ TRÍ NHỚ', is_active: true },
    { id: 7, name: 'GHÉP HÀNG 3', is_active: true }
  ]);
};