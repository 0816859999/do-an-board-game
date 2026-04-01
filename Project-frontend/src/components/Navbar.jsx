import { Link, useNavigate } from "react-router-dom";
import { Gamepad2, LogOut, Sun, Moon } from "lucide-react"; // Thêm icon Sun, Moon

export default function Navbar({ user, onLogout, isDarkMode, setIsDarkMode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/"); 
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-amber-500 font-black text-xl tracking-widest hover:scale-105 transition-transform">
          <Gamepad2 size={28} />
          BOARD GAME
        </Link>
        
        <div className="flex gap-6 ml-8">
          <Link to="/" className="text-slate-300 hover:text-white font-semibold transition-colors">Chơi Game</Link>
          <Link to="/profile" className="text-slate-300 hover:text-white font-semibold transition-colors">Cộng Đồng & Cá Nhân</Link>
          
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-rose-400 hover:text-rose-300 font-bold transition-colors">Quản trị Admin</Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* NÚT CHUYỂN ĐỔI DARK/LIGHT MODE */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="p-2 bg-slate-700 hover:bg-slate-600 text-amber-400 rounded-full transition-colors shadow-inner"
          title="Chuyển chế độ Sáng/Tối"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} className="text-slate-300" />}
        </button>

        <span className="text-slate-300 text-sm font-semibold border-l border-slate-600 pl-4">
          Chào, <span className="text-amber-500 font-bold">{user?.fullname || user?.username}</span>!
        </span>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest px-3 py-2 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors"
        >
          <LogOut size={16} /> Thoát
        </button>
      </div>
    </nav>
  );
}