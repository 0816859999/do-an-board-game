/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 1. Phải xóa bảng con (chứa game_id) trước khi xóa bảng cha (games)
  await knex('ratings').del();
  await knex('game_saves').del();
  
  // 2. Xóa toàn bộ dữ liệu cũ trong bảng games
  await knex('games').del();
  
  // 3. Bơm 7 game chuẩn theo frontend vào
  await knex('games').insert([
    { id: 1, name: 'TIC-TAC-TOE', is_active: true },
    { id: 2, name: 'CỜ CARO (5)', is_active: true },
    { id: 3, name: 'CỜ CARO (4)', is_active: true },
    { id: 4, name: 'BẢNG VẼ TỰ DO', is_active: true },
    { id: 5, name: 'RẮN SĂN MỒI', is_active: true },
    { id: 6, name: 'CỜ TRÍ NHỚ', is_active: true },
    { id: 7, name: 'GHÉP HÀNG 3', is_active: true }
  ]);

  console.log("✅ File 01: Đã bơm danh sách Game thành công!");
};