import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Undo2, CornerDownLeft, CircleHelp } from "lucide-react";

export default function GameControls({ onLeft, onRight, onUp, onDown, onBack, onEnter, onHelp, isPlaying }) {
  return (
    <div className="flex flex-col items-center mt-6">
      <div className="bg-slate-100 p-4 rounded-3xl shadow-sm border border-slate-200">
        
        {/* KHU VỰC ĐIỀU HƯỚNG (D-PAD) */}
        <div className="flex flex-col items-center mb-6">
          {/* Nút Lên (Chỉ hiện khi đang chơi game) */}
          <div className="h-14 mb-2">
            {isPlaying && (
              <button onClick={onUp} className="w-14 h-14 bg-slate-700 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all">
                <ArrowUp size={28} />
              </button>
            )}
          </div>

          {/* Nút Trái - Xuống - Phải */}
          <div className="flex justify-center gap-2">
            <button onClick={onLeft} className="w-14 h-14 bg-slate-700 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all">
              <ArrowLeft size={28} />
            </button>
            
            <div className="w-14 h-14">
              {isPlaying && (
                <button onClick={onDown} className="w-14 h-14 bg-slate-700 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all">
                  <ArrowDown size={28} />
                </button>
              )}
            </div>

            <button onClick={onRight} className="w-14 h-14 bg-slate-700 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all">
              <ArrowRight size={28} />
            </button>
          </div>
        </div>

        {/* KHU VỰC NÚT CHỨC NĂNG */}
        <div className="flex justify-center gap-4">
          <div className="flex flex-col items-center">
            <button onClick={onBack} className="w-12 h-12 bg-amber-400 hover:bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all">
              <Undo2 size={24} />
            </button>
            <span className="text-[10px] font-bold text-slate-500 mt-1 tracking-wider">BACK</span>
          </div>
          <div className="flex flex-col items-center">
            <button onClick={onEnter} className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all">
              <CornerDownLeft size={24} />
            </button>
            <span className="text-[10px] font-bold text-slate-500 mt-1 tracking-wider">ENTER</span>
          </div>
          <div className="flex flex-col items-center">
            <button onClick={onHelp} className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all">
              <CircleHelp size={24} />
            </button>
            <span className="text-[10px] font-bold text-slate-500 mt-1 tracking-wider">HELP</span>
          </div>
        </div>

      </div>
    </div>
  );
}