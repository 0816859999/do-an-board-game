require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const saveRoutes = require('./routes/saveRoutes'); 
const featureRoutes = require('./routes/featureRoutes');
const adminRoutes = require('./routes/adminRoutes');
const socialRoutes = require('./routes/socialRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// === CÁC ROUTE API GIỮ NGUYÊN ===
app.use('/api/features', featureRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saves', saveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/social', socialRoutes);

// === CẤU HÌNH GỘP FRONTEND (VITE) VÀO BACKEND ===
// 1. Phục vụ các file tĩnh (HTML, CSS, JS, hình ảnh) từ thư mục 'dist' của Frontend
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Chuyển hướng mọi request (không phải là API) về lại file index.html của React
// Điều này cực kỳ quan trọng nếu Frontend của bạn có dùng React Router (chuyển trang)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy thành công tại: http://localhost:${PORT}`);
});