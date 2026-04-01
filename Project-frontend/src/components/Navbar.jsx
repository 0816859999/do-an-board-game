import { Link, useNavigate } from "react-router-dom";
import { Gamepad2, LogOut } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/"); // Đẩy về trang chủ sau khi đăng xuất
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-amber-500 font-black text-xl tracking-widest hover:scale-105 transition-transform">
          <Gamepad2 size={28} />
          BOARD GAME
        </Link>
        
        {/* CÁC MENU ĐIỀU HƯỚNG */}
        <div className="flex gap-6 ml-8">
          <Link to="/" className="text-slate-300 hover:text-white font-semibold transition-colors">Chơi Game</Link>
          <Link to="/profile" className="text-slate-300 hover:text-white font-semibold transition-colors">Cộng Đồng & Cá Nhân</Link>
          
          {/* Chỉ hiện menu Admin nếu role của user là ADMIN */}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-rose-400 hover:text-rose-300 font-bold transition-colors">Quản trị Admin</Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-slate-300 text-sm font-semibold">
          Chào, <span className="text-amber-500 font-bold">{user?.fullname || user?.username}</span>!
        </span>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest px-3 py-2 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors"
        >
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </nav>
  );
}