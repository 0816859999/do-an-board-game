import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GameBoard from "./components/game/GameBoard";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import AdminPage from "./components/AdminPage"; 
import ProfilePage from "./components/ProfilePage";

export default function App() {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // THÊM: Quản lý chế độ Sáng/Tối

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

  if (!user) {
    return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <BrowserRouter>
      {/* THÊM: Thay đổi màu nền tổng thể dựa vào Dark Mode */}
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
        
        <Navbar user={user} onLogout={handleLogout} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        <div className="flex-1 relative flex flex-col">
          <Routes>
            <Route path="/" element={<GameBoard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={user.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {/* THÊM: Footer để lấy trọn điểm giao diện */}
        <footer className={`py-4 text-center text-sm font-semibold border-t transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-600 border-slate-300 shadow-inner'}`}>
          <p>© 2026 - Dự án Board Game Ma Trận LED | Nhóm 08 - Môn Lập trình ứng dụng Web</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}