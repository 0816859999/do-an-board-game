import { useState, useEffect } from "react";
import { Search, UserPlus, Check, MessageSquare, Send, Award, Users } from "lucide-react";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  
  // States cho Kết bạn & Tìm kiếm
  const [friends, setFriends] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  // States cho Chat
  const [activeChat, setActiveChat] = useState(null); // Lưu thông tin người đang chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
    fetchFriends();
  }, []);

  // --- API: LẤY DANH SÁCH BẠN BÈ & LỜI MỜI ---
  const fetchFriends = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/social/friends", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setFriends(data.data);
    } catch (error) {
      console.error("Lỗi tải bạn bè");
    }
  };

  // --- API: TÌM KIẾM NGƯỜI DÙNG ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/social/search?keyword=${searchKeyword}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSearchResults(data.data.filter(u => u.id !== currentUser?.id)); // Không hiển thị chính mình
    } catch (error) {
      console.error("Lỗi tìm kiếm");
    }
  };

  // --- API: GỬI LỜI MỜI KẾT BẠN ---
  const sendFriendRequest = async (friendId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/social/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ friend_id: friendId })
      });
      const data = await res.json();
      if (data.success) {
        alert("Đã gửi lời mời!");
        fetchFriends(); // Cập nhật lại danh sách
      } else alert(data.message);
    } catch (error) {
      alert("Lỗi kết nối!");
    }
  };

  // --- API: CHẤP NHẬN KẾT BẠN ---
  const acceptRequest = async (friendId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/social/friends/accept", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ friend_id: friendId })
      });
      if (res.ok) {
        alert("Đã trở thành bạn bè!");
        fetchFriends();
      }
    } catch (error) {
      alert("Lỗi kết nối!");
    }
  };

  // --- API: LẤY TIN NHẮN ---
  const fetchMessages = async (friendId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/social/messages/${friendId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (error) {
      console.error("Lỗi tải tin nhắn");
    }
  };

  // Bấm vào 1 người bạn để mở khung chat
  const openChat = (friend) => {
    setActiveChat(friend);
    fetchMessages(friend.id);
  };

  // --- API: GỬI TIN NHẮN ---
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/social/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: activeChat.id, content: newMessage })
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages(activeChat.id); // Tải lại tin nhắn mới
      }
    } catch (error) {
      alert("Lỗi gửi tin nhắn");
    }
  };

  // Phân loại bạn bè
  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingRequests = friends.filter(f => f.status === 'pending' && f.type === 'received'); // Lời mời người khác gửi cho mình

  return (
    <div className="flex-1 flex gap-6 p-6 max-w-7xl mx-auto w-full text-slate-200 h-[calc(100vh-80px)]">
      
      {/* CỘT TRÁI: TÌM KIẾM & BẠN BÈ */}
      <div className="w-1/3 flex flex-col gap-6 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        
        {/* Khung Thông tin cá nhân */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-700">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg">
            {currentUser?.fullname?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{currentUser?.fullname}</h2>
            <p className="text-slate-400 text-sm">@{currentUser?.username}</p>
          </div>
        </div>

        {/* Khung Tìm kiếm */}
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Tìm kiếm người chơi..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
          />
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-700 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-10 max-h-60 overflow-y-auto">
              <div className="px-4 py-2 bg-slate-800 text-xs font-bold text-slate-400">KẾT QUẢ TÌM KIẾM</div>
              {searchResults.map(user => (
                <div key={user.id} className="flex justify-between items-center p-3 hover:bg-slate-600 transition-colors border-b border-slate-600/50 last:border-0">
                  <span className="font-semibold">{user.fullname}</span>
                  <button onClick={() => sendFriendRequest(user.id)} className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"><UserPlus size={16}/></button>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Danh sách Lời mời kết bạn */}
        {pendingRequests.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2"><UserPlus size={16}/> LỜI MỜI KẾT BẠN ({pendingRequests.length})</h3>
            <div className="flex flex-col gap-2">
              {pendingRequests.map(req => (
                <div key={req.id} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-xl border border-rose-500/30">
                  <span className="font-semibold">{req.fullname}</span>
                  <button onClick={() => acceptRequest(req.id)} className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"><Check size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danh sách Bạn bè */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2"><Users size={16}/> BẠN BÈ ({acceptedFriends.length})</h3>
          {acceptedFriends.length === 0 ? (
            <p className="text-slate-500 text-sm italic text-center mt-4">Bạn chưa có người bạn nào.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {acceptedFriends.map(friend => (
                <button 
                  key={friend.id} 
                  onClick={() => openChat(friend)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${activeChat?.id === friend.id ? 'bg-slate-700 border-amber-500' : 'bg-slate-700/30 border-transparent hover:bg-slate-700'}`}
                >
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center font-bold text-amber-400">
                    {friend.fullname.charAt(0)}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-white">{friend.fullname}</p>
                    <p className="text-xs text-slate-400">Đã kết bạn</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI: KHUNG CHAT & THÀNH TỰU */}
      <div className="w-2/3 flex flex-col bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        {activeChat ? (
          // HIỂN THỊ KHUNG CHAT KHI CHỌN BẠN BÈ
          <>
            <div className="p-4 bg-slate-700/80 border-b border-slate-600 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-bold text-white shadow-md">
                {activeChat.fullname.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white">{activeChat.fullname}</h3>
                <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online (Tin nhắn Offline)</p>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-slate-900/50">
              {messages.length === 0 ? (
                <div className="m-auto text-slate-500 flex flex-col items-center gap-2">
                  <MessageSquare size={48} className="opacity-20" />
                  <p>Hãy gửi lời chào đến {activeChat.fullname}!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.sender_id === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${isMine ? 'bg-amber-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-slate-700/50 border-t border-slate-600 flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..." 
                className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button type="submit" className="px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors flex items-center justify-center">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          // HIỂN THỊ THÀNH TỰU NẾU CHƯA CHỌN CHAT
          <div className="flex-1 p-8">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest"><Award className="text-amber-500"/> Thành tựu của bạn</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/40 border border-slate-600 p-4 rounded-xl flex items-center gap-4 opacity-50">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-500"><Award className="text-slate-500" /></div>
                <div><h4 className="font-bold text-white">Cao thủ Caro</h4><p className="text-xs text-slate-400">Thắng 10 ván Caro (Chưa mở khóa)</p></div>
              </div>
              <div className="bg-slate-700/40 border border-slate-600 p-4 rounded-xl flex items-center gap-4 opacity-50">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-500"><Award className="text-slate-500" /></div>
                <div><h4 className="font-bold text-white">Vua Rắn</h4><p className="text-xs text-slate-400">Đạt 1000 điểm Rắn săn mồi (Chưa mở khóa)</p></div>
              </div>
            </div>
            <p className="text-slate-500 mt-10 text-center italic">Hãy chọn một người bạn ở cột bên trái để bắt đầu trò chuyện.</p>
          </div>
        )}
      </div>

    </div>
  );
}