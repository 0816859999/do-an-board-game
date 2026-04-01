import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GameBoard from "./components/game/GameBoard";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import AdminPage from "./components/AdminPage"; 
import ProfilePage from "./components/ProfilePage";


export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // NẾU CHƯA ĐĂNG NHẬP -> HIỂN THỊ MÀN HÌNH AUTH
  if (!user) {
    return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
  }

  // NẾU ĐÃ ĐĂNG NHẬP -> KHỞI ĐỘNG BỘ ĐỊNH TUYẾN
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 flex flex-col">
        
        {/* Thanh Navbar luôn hiển thị ở trên cùng */}
        <Navbar user={user} onLogout={handleLogout} />

        {/* Nội dung thay đổi tùy theo đường link trên trình duyệt */}
        <div className="flex-1 relative flex flex-col">
          <Routes>
            {/* Đường dẫn gốc: Hiển thị bàn game */}
            <Route path="/" element={<GameBoard />} />
            
            {/* Đường dẫn /profile: Hiển thị trang cá nhân */}
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Đường dẫn /admin: BẢO MẬT - Chỉ cho phép role ADMIN truy cập */}
            <Route 
              path="/admin" 
              element={user.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/" />} 
            />
            
            {/* Nếu người dùng gõ link bậy bạ -> Tự động đẩy về trang chủ */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}