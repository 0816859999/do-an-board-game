const knex = require('knex');
const knexfile = require('./knexfile');

// Lấy cấu hình development từ knexfile.js
const db = knex(knexfile.development);

module.exports = db;