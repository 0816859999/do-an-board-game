import { useState } from "react";
import { UserPlus, LogIn, Gamepad2 } from "lucide-react";

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Quyết định gọi đường dẫn Login hay Register
    const endpoint = isLogin ? "/api/users/login" : "/api/users/register";
    const payload = isLogin ? { username, password } : { username, password, fullname };

    try {
      // Gọi xuống Backend Express (cổng 5000)
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (isLogin) {
          // Lưu token như một "Thẻ thông hành" vào ví của trình duyệt
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          // Báo cho App.jsx biết là đã đăng nhập xong
          onLoginSuccess(data.user);
        } else {
          alert("Tạo tài khoản thành công! Bây giờ hãy đăng nhập nhé.");
          setIsLogin(true); // Chuyển về màn Đăng nhập
        }
      } else {
        setError(data.message); // Hiển thị lỗi từ backend (vd: sai pass, trùng tên...)
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ! Vui lòng kiểm tra lại Backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-700">
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] mb-4">
            <Gamepad2 size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase">
            {isLogin ? "ĐĂNG NHẬP" : "TẠO TÀI KHOẢN"}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Hệ thống Board Game Ma Trận LED</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm font-semibold text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Họ và tên của bạn"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="px-4 py-3 bg-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
              required
            />
          )}
          
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 bg-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
            required
          />
          
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 bg-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : isLogin ? <><LogIn size={20} /> VÀO GAME</> : <><UserPlus size={20} /> ĐĂNG KÝ</>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors underline decoration-slate-500 underline-offset-4"
          >
            {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Quay lại Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}