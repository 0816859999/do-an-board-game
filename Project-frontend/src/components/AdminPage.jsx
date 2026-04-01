import { useState, useEffect } from "react";
import { Users, Gamepad2, Save, Star, Power, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalGames: 0, totalSaves: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // THÊM STATE CHO PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Gọi lại API khi currentPage thay đổi
  useEffect(() => {
    fetchAdminData();
  }, [currentPage]);

  const fetchAdminData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const headersAuth = { "Authorization": `Bearer ${token}`, "x-api-key": "Nhom08_Secret_2026" };
      const headersPublic = { "x-api-key": "Nhom08_Secret_2026" };

      // ĐÃ SỬA: Truyền tham số page và limit vào URL của API users
      const [statsRes, usersRes, gamesRes] = await Promise.all([
        fetch("https://localhost:5000/api/admin/stats", { headers: headersAuth }),
        fetch(`https://localhost:5000/api/admin/users?page=${currentPage}&limit=5`, { headers: headersAuth }),
        fetch("https://localhost:5000/api/games", { headers: headersPublic }) 
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const gamesData = await gamesRes.json();

      if (statsData.success) setStats(statsData.data);
      if (gamesData.success) setGames(gamesData.data);
      
      // ĐÃ SỬA: Cập nhật danh sách user và tổng số trang từ Backend trả về
      if (usersData.success) {
        setUsers(usersData.data);
        if (usersData.pagination) setTotalPages(usersData.pagination.totalPages);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Admin:", error);
      setLoading(false);
    }
  };

  const handleToggleGame = async (gameId, currentStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://localhost:5000/api/admin/games/${gameId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`,
          "x-api-key": "Nhom08_Secret_2026" 
        },
        body: JSON.stringify({ is_active: !currentStatus }) 
      });
      const data = await res.json();
      if (data.success) {
        setGames(games.map(g => g.id === gameId ? { ...g, is_active: !currentStatus } : g));
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center text-amber-500 font-bold">Đang tải dữ liệu hệ thống...</div>;

  return (
    <div className="flex-1 p-8 text-slate-200 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert size={32} className="text-rose-500" />
          <h1 className="text-3xl font-black tracking-widest text-white uppercase">Bảng Điều Khiển Quản Trị</h1>
        </div>

        {/* THỐNG KÊ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-800 border-l-4 border-blue-500 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
              <div><p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Người dùng</p><h3 className="text-3xl font-black text-white">{stats.totalUsers}</h3></div>
              <div className="p-3 bg-blue-500/20 rounded-lg"><Users className="text-blue-500" /></div>
            </div>
          </div>
          <div className="bg-slate-800 border-l-4 border-amber-500 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
              <div><p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Trò chơi</p><h3 className="text-3xl font-black text-white">{stats.totalGames}</h3></div>
              <div className="p-3 bg-amber-500/20 rounded-lg"><Gamepad2 className="text-amber-500" /></div>
            </div>
          </div>
          <div className="bg-slate-800 border-l-4 border-green-500 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
              <div><p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Lượt lưu Game</p><h3 className="text-3xl font-black text-white">{stats.totalSaves}</h3></div>
              <div className="p-3 bg-green-500/20 rounded-lg"><Save className="text-green-500" /></div>
            </div>
          </div>
          <div className="bg-slate-800 border-l-4 border-pink-500 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
              <div><p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Đánh giá</p><h3 className="text-3xl font-black text-white">{stats.totalRatings}</h3></div>
              <div className="p-3 bg-pink-500/20 rounded-lg"><Star className="text-pink-500" /></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QUẢN LÝ NGƯỜI DÙNG */}
          <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden flex flex-col">
            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users size={20}/> DANH SÁCH NGƯỜI DÙNG</h2>
            </div>
            <div className="p-6 overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse mb-4">
                <thead>
                  <tr className="text-slate-400 text-sm border-b border-slate-700">
                    <th className="pb-3 font-semibold">Tên đăng nhập</th>
                    <th className="pb-3 font-semibold">Họ và tên</th>
                    <th className="pb-3 font-semibold">Quyền</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 font-medium text-white">{u.username}</td>
                      <td className="py-4 text-slate-300">{u.fullname}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-md ${u.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-600/50 text-slate-300'}`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* GIAO DIỆN NÚT BẤM PHÂN TRANG */}
            <div className="bg-slate-700/30 px-6 py-4 border-t border-slate-700 flex justify-between items-center">
              <span className="text-sm text-slate-400">Trang {currentPage} / {totalPages || 1}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 text-white rounded-lg transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* QUẢN LÝ GAME */}
          <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Gamepad2 size={20}/> QUẢN LÝ TRÒ CHƠI</h2>
            </div>
            <div className="p-6 flex flex-col gap-3">
              {games.map(game => (
                <div key={game.id} className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600 rounded-lg hover:border-slate-500 transition-colors">
                  <span className="font-bold text-white tracking-wide">{game.name}</span>
                  <button 
                    onClick={() => handleToggleGame(game.id, game.is_active)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${game.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                  >
                    <Power size={16} />
                    {game.is_active ? "ĐANG BẬT" : "ĐÃ TẮT"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}