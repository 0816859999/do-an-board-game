module.exports = (req, res, next) => {
  const apiKey = req.header('x-api-key');

  if (!apiKey || apiKey !== process.env.X_API_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Lỗi bảo mật: API Key không hợp lệ hoặc bị thiếu!'
    });
  }

  next();
};