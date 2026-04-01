require('dotenv').config();
const express = require('express');
const cors = require('cors');

const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const saveRoutes = require('./routes/saveRoutes'); // DÒNG MỚI THÊM 1
const featureRoutes = require('./routes/featureRoutes');
const adminRoutes = require('./routes/adminRoutes');
const socialRoutes = require('./routes/socialRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/features', featureRoutes);

app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saves', saveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/social', socialRoutes);

app.get('/', (req, res) => {
  res.send('Chào mừng đến với Backend Board Game API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server Backend đang chạy thành công tại: http://localhost:${PORT}`);
});