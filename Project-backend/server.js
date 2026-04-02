require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const jwt = require('jsonwebtoken'); // Cần để xác thực Admin

const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const saveRoutes = require('./routes/saveRoutes'); 
const featureRoutes = require('./routes/featureRoutes');
const adminRoutes = require('./routes/adminRoutes');
const socialRoutes = require('./routes/socialRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// --- CẤU HÌNH SWAGGER (TÀI LIỆU API) ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Board Game API', version: '1.0.0', description: 'Tài liệu API cho dự án Board Game' },
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // Quét các file trong thư mục routes để lấy comment tạo Docs
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware chặn quyền: Yêu cầu đăng nhập Admin mới xem được API Docs
const requireAdminDocs = (req, res, next) => {
  // Lấy token từ thanh URL (VD: /api-docs?token=abc...)
  const token = req.query.token; 
  if (!token) return res.status(401).send("<h1>LỖI: BẠN CẦN TRUY CẬP KÈM TOKEN QUẢN TRỊ VIÊN Ở URL!</h1><p>Ví dụ: https://localhost:5000/api-docs?token=MÃ_TOKEN_CỦA_ADMIN</p>");

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'DO_AN_BOARD_GAME_SECRET_KEY';
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') return res.status(403).send("<h1>TỪ CHỐI: CHỈ ADMIN MỚI ĐƯỢC XEM TÀI LIỆU API!</h1>");
    next();
  } catch (error) {
    return res.status(401).send("<h1>TOKEN KHÔNG HỢP LỆ HOẶC ĐÃ HẾT HẠN!</h1>");
  }
};

// Gắn Swagger vào đường dẫn /api-docs (có kẹp middleware bảo vệ)
app.use('/api-docs', requireAdminDocs, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ----------------------------------------

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
  console.log(`📚 Tài liệu API (Admin only): http://localhost:${PORT}/api-docs?token=`);
});