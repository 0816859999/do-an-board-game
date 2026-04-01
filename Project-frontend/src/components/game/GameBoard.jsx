import { useState, useEffect } from "react";
import GameControls from "./GameControls";
import { Save, FolderOpen, Star, X, Trophy, MessageSquare } from "lucide-react";

const ROWS = 20; const COLS = 20;

const GAMES = [
  { id: 1, name: "TIC-TAC-TOE", color: "bg-blue-500", shadow: "shadow-[0_0_8px_rgba(59,130,246,0.8)]" },
  { id: 2, name: "CỜ CARO (5)", color: "bg-red-500", shadow: "shadow-[0_0_8px_rgba(239,68,68,0.8)]" },
  { id: 3, name: "CỜ CARO (4)", color: "bg-rose-400", shadow: "shadow-[0_0_8px_rgba(251,113,133,0.8)]" },
  { id: 4, name: "BẢNG VẼ TỰ DO", color: "bg-purple-500", shadow: "shadow-[0_0_8px_rgba(168,85,247,0.8)]" },
  { id: 5, name: "RẮN SĂN MỒI", color: "bg-green-500", shadow: "shadow-[0_0_8px_rgba(34,197,94,0.8)]" },
  { id: 6, name: "CỜ TRÍ NHỚ", color: "bg-teal-500", shadow: "shadow-[0_0_8px_rgba(20,184,166,0.8)]" },
  { id: 7, name: "GHÉP HÀNG 3", color: "bg-pink-500", shadow: "shadow-[0_0_8px_rgba(236,72,153,0.8)]" },
];

const MENU_ARTS = [
  [ "                    ", "  X   X      OOO    ", "   X X      O   O   ", "    X   --- O   O   ", "   X X      O   O   ", "  X   X      OOO    ", "                    " ],
  [ "                    ", " CCC  A  RRR OOO 555", " C   A A R R O O 5  ", " C   AAA RRR O O 555", " C   A A R R O O   5", " CCC A A R R OOO 555", "                    " ],
  [ "                    ", " CCC  A  RRR OOO 4 4", " C   A A R R O O 4 4", " C   AAA RRR O O 444", " C   A A R R O O   4", " CCC A A R R OOO   4", "                    " ],
  [ "                    ", " DDD RRR  A  W W W  ", " D D R R A A W W W  ", " D D RRR AAA W W W  ", " D D R R A A W W W  ", " DDD R R A A  W W   ", "                    " ],
  [ "                    ", " SSS N N  A  K K EEE", " S   NNN A A KK  E  ", " SSS N N AAA K K EEE", "   S N N A A KK  E  ", " SSS N N A A K K EEE", "                    " ],
  [ "                    ", " M   M EEE M   M OOO", " MM MM E   MM MM O O", " M M M EEE M M M O O", " M   M E   M   M O O", " M   M EEE M   M OOO", "                    " ],
  [ "                    ", " M M  A  TTT CCC 333", " MMM A A  T  C     3", " M M AAA  T  C   333", " M M A A  T  C     3", " M M A A  T  CCC 333", "                    " ]
];

const M3_COLORS = [30, 31, 32, 33, 34];

export default function GameBoard() {
  const [board, setBoard] = useState([]);
  const [appState, setAppState] = useState("MENU"); 
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [tttBoard, setTttBoard] = useState(Array(3).fill(null).map(()=>Array(3).fill(null)));
  const [caroBoard, setCaroBoard] = useState(Array(ROWS).fill(null).map(()=>Array(COLS).fill(null)));
  const [drawBoard, setDrawBoard] = useState(Array(ROWS).fill(0).map(()=>Array(COLS).fill(0)));
  const [snake, setSnake] = useState([]); const [snakeDir, setSnakeDir] = useState("RIGHT"); const [food, setFood] = useState({r: 5, c: 15}); const [isGameOver, setIsGameOver] = useState(false);
  const [memBoard, setMemBoard] = useState([]); const [memRevealed, setMemRevealed] = useState([]); const [memFlipped, setMemFlipped] = useState([]); const [memMatches, setMemMatches] = useState(0);
  const [m3Board, setM3Board] = useState(Array(8).fill(0).map(()=>Array(8).fill(0)));
  const [m3Selected, setM3Selected] = useState(null); 

  const [cursor, setCursor] = useState({ r: 1, c: 1 }); 
  const [turn, setTurn] = useState('X'); 
  const [winner, setWinner] = useState(null); 
  const [time, setTime] = useState(0); 
  const [score, setScore] = useState(0);

  // --- STATES CHO MODAL ---
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedGames, setSavedGames] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingsList, setRatingsList] = useState([]);
  const [myStars, setMyStars] = useState(5);
  const [myComment, setMyComment] = useState("");

  const [showRankModal, setShowRankModal] = useState(false);
  const [rankFilter, setRankFilter] = useState("global"); 
  const [rankData, setRankData] = useState([]);

  // --- API LƯU/TẢI GAME ---
  const handleSaveGame = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Bạn cần đăng nhập để lưu game!");
    setIsSaving(true);
    const state = { tttBoard, caroBoard, drawBoard, snake, snakeDir, food, memBoard, memRevealed, m3Board };
    try {
      const res = await fetch("http://localhost:5000/api/saves", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ game_id: selectedIndex + 1, board_state: state, score, play_time_seconds: time }),
      });
      const data = await res.json();
      if (data.success) alert("💾 Đã lưu game thành công!"); else alert("Lỗi: " + data.message);
    } catch (e) { alert("Lỗi mạng!"); } finally { setIsSaving(false); }
  };

  const handleLoadList = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Bạn cần đăng nhập để tải game!");
    try {
      const res = await fetch("http://localhost:5000/api/saves", { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setSavedGames(data.data); setShowLoadModal(true); }
    } catch (e) { alert("Lỗi mạng!"); }
  };

  const restoreGame = (saved) => {
    const state = typeof saved.board_state === 'string' ? JSON.parse(saved.board_state) : saved.board_state;
    setSelectedIndex(saved.game_id - 1); setScore(saved.score); setTime(saved.play_time_seconds); setAppState("PLAYING"); setWinner(null); setIsGameOver(false);
    if(state.tttBoard) setTttBoard(state.tttBoard); if(state.caroBoard) setCaroBoard(state.caroBoard); if(state.drawBoard) setDrawBoard(state.drawBoard);
    if(state.snake) { setSnake(state.snake); setSnakeDir(state.snakeDir); setFood(state.food); }
    if(state.memBoard) { setMemBoard(state.memBoard); setMemRevealed(state.memRevealed); } if(state.m3Board) setM3Board(state.m3Board);
    setShowLoadModal(false); alert(`Đã tải game: ${saved.game_name}`);
  };

  // --- API ĐÁNH GIÁ (RATING) ---
  const handleOpenRating = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/features/rating/${selectedIndex + 1}`);
      const data = await res.json();
      if(data.success) setRatingsList(data.data);
      setShowRatingModal(true);
    } catch(e) { alert("Lỗi mạng!"); }
  };

  const submitRating = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Cần đăng nhập để đánh giá!");
    try {
      await fetch("http://localhost:5000/api/features/rating", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ game_id: selectedIndex + 1, stars: myStars, comment: myComment })
      });
      setMyComment(""); handleOpenRating(); // Reload list
    } catch(e) { alert("Lỗi mạng!"); }
  };

  // --- API XẾP HẠNG (RANKING) ---
  const handleOpenRanking = async (filter = "global") => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Bạn cần đăng nhập để xem bảng xếp hạng!");
    setRankFilter(filter);
    try {
      const res = await fetch(`http://localhost:5000/api/features/ranking/${selectedIndex + 1}?filter=${filter}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if(data.success) { setRankData(data.data); setShowRankModal(true); }
    } catch(e) { alert("Lỗi mạng!"); }
  };

  useEffect(() => {
    let interval; if (appState === "PLAYING" && !winner && !isGameOver && !showLoadModal && !showRatingModal && !showRankModal) interval = setInterval(() => setTime(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [appState, winner, isGameOver, showLoadModal, showRatingModal, showRankModal]);
  
  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  
  // Game Logic
  const findM3Matches = (b) => { let matched = Array(8).fill(0).map(()=>Array(8).fill(false)); let hasMatch = false; for(let r=0; r<8; r++) for(let c=0; c<6; c++) if(b[r][c] && b[r][c]===b[r][c+1] && b[r][c]===b[r][c+2]) { matched[r][c]=matched[r][c+1]=matched[r][c+2]=true; hasMatch=true; let k=c+3; while(k<8 && b[r][k]===b[r][c]) { matched[r][k]=true; k++; } } for(let c=0; c<8; c++) for(let r=0; r<6; r++) if(b[r][c] && b[r][c]===b[r+1][c] && b[r][c]===b[r+2][c]) { matched[r][c]=matched[r+1][c]=matched[r+2][c]=true; hasMatch=true; let k=r+3; while(k<8 && b[k][c]===b[r][c]) { matched[k][c]=true; k++; } } return {hasMatch, matched}; };
  const processM3Matches = (b, matched) => { let newB = b.map(r => [...r]); let pts = 0; for(let c=0; c<8; c++) { let col = []; for(let r=0; r<8; r++) { if(!matched[r][c]) col.push(newB[r][c]); else pts+=10; } while(col.length < 8) col.unshift(M3_COLORS[Math.floor(Math.random()*5)]); for(let r=0; r<8; r++) newB[r][c] = col[r]; } return {newB, pts}; };
  useEffect(() => { if (appState === "PLAYING" && selectedIndex === 6) { const {hasMatch, matched} = findM3Matches(m3Board); if (hasMatch) { setTurn('WAIT'); const timer = setTimeout(() => { const {newB, pts} = processM3Matches(m3Board, matched); setM3Board(newB); setScore(s => s + pts); }, 400); return () => clearTimeout(timer); } else setTurn('X'); } }, [m3Board, appState, selectedIndex]);
  const checkTttWinner = (b) => { const l=[[[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]],[[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]],[[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]]]; for(let x of l) if(b[x[0][0]][x[0][1]]&&b[x[0][0]][x[0][1]]===b[x[1][0]][x[1][1]]&&b[x[0][0]][x[0][1]]===b[x[2][0]][x[2][1]]) return b[x[0][0]][x[0][1]]; if(b.flat().every(c=>c!==null)) return 'DRAW'; return null; };
  const checkCaroWinner = (b, r, c, p, w) => { const d=[[0,1],[1,0],[1,1],[1,-1]]; for(let [dr,dc] of d){ let cnt=1; for(let i=1;i<=w;i++){if(b[r+dr*i]?.[c+dc*i]===p)cnt++;else break;} for(let i=1;i<=w;i++){if(b[r-dr*i]?.[c-dc*i]===p)cnt++;else break;} if(cnt>=w)return p;} return null; };
  useEffect(() => { if (appState === "PLAYING" && turn === 'O' && !winner && selectedIndex < 3) { const to = setTimeout(() => { let e = []; if (selectedIndex === 0) { for(let r=0;r<3;r++) for(let c=0;c<3;c++) if(!tttBoard[r][c]) e.push({r,c}); if(e.length>0){const rc=e[Math.floor(Math.random()*e.length)];const nb=[...tttBoard];nb[rc.r][rc.c]='O';setTttBoard(nb);setWinner(checkTttWinner(nb));setTurn('X');} } else if (selectedIndex === 1 || selectedIndex === 2) { for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(!caroBoard[r][c]) e.push({r,c}); if(e.length>0){const rc=e[Math.floor(Math.random()*e.length)];const nb=[...caroBoard];nb[rc.r][rc.c]='O';setCaroBoard(nb);setWinner(checkCaroWinner(nb,rc.r,rc.c,'O',selectedIndex===1?5:4));setTurn('X');} } }, 300); return () => clearTimeout(to); } }, [turn, appState, tttBoard, caroBoard, winner, selectedIndex]);
  useEffect(() => { if (appState === "PLAYING" && selectedIndex === 4 && !isGameOver && !showLoadModal && !showRatingModal && !showRankModal) { const itv = setInterval(() => { setSnake((p) => { const h = {...p[0]}; if(snakeDir==="UP")h.r-=1;if(snakeDir==="DOWN")h.r+=1;if(snakeDir==="LEFT")h.c-=1;if(snakeDir==="RIGHT")h.c+=1; if(h.r<0||h.r>=ROWS||h.c<0||h.c>=COLS||p.some(d=>d.r===h.r&&d.c===h.c)){setIsGameOver(true);return p;} const ns=[h,...p]; if(h.r===food.r&&h.c===food.c){setScore(s=>s+10);setFood({r:Math.floor(Math.random()*ROWS),c:Math.floor(Math.random()*COLS)});}else ns.pop(); return ns; }); }, Math.max(80, 200 - score * 5)); return () => clearInterval(itv); } }, [appState, selectedIndex, snakeDir, isGameOver, food, score, showLoadModal, showRatingModal, showRankModal]);
  useEffect(() => { const newBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(0)); if (appState === "MENU") { const art = MENU_ARTS[selectedIndex]; for(let r=0; r < art.length; r++) for(let c=0; c < art[r].length; c++) if (art[r][c] !== ' ' && (r+6) < ROWS && c < COLS) newBoard[r+6][c] = 1; } else if (appState === "PLAYING") { if (selectedIndex === 0) { for (let i=4; i<=15; i++) { newBoard[7][i]=2; newBoard[11][i]=2; newBoard[i][7]=2; newBoard[i][11]=2; } for(let r=0; r<3; r++) for(let c=0; c<3; c++) { if (tttBoard[r][c] === 'X') { const dr=r*4+5,dc=c*4+5;newBoard[dr-1][dc-1]=4;newBoard[dr-1][dc+1]=4;newBoard[dr][dc]=4;newBoard[dr+1][dc-1]=4;newBoard[dr+1][dc+1]=4; } if (tttBoard[r][c] === 'O') { const dr=r*4+5,dc=c*4+5;newBoard[dr-1][dc]=5;newBoard[dr+1][dc]=5;newBoard[dr][dc-1]=5;newBoard[dr][dc+1]=5; } } if (!winner && turn === 'X' && !tttBoard[cursor.r][cursor.c]) newBoard[cursor.r*4+5][cursor.c*4+5] = 3; } else if (selectedIndex === 1 || selectedIndex === 2) { for(let r=0; r<ROWS; r++) for(let c=0; c<COLS; c++) { if (caroBoard[r][c] === 'X') newBoard[r][c] = 4; if (caroBoard[r][c] === 'O') newBoard[r][c] = 5; } if (!winner && turn === 'X' && !caroBoard[cursor.r][cursor.c]) newBoard[cursor.r][cursor.c] = 3; } else if (selectedIndex === 3) { for(let r=0; r<ROWS; r++) for(let c=0; c<COLS; c++) if (drawBoard[r][c] !== 0) newBoard[r][c] = drawBoard[r][c]; newBoard[cursor.r][cursor.c] = 3; } else if (selectedIndex === 4) { newBoard[food.r][food.c] = 8; snake.forEach((d, i) => { newBoard[d.r][d.c] = i===0 ? 6 : 9; }); } else if (selectedIndex === 5) { for(let r=7; r<=12; r++) for(let c=7; c<=12; c++) { if (r===7||r===12||c===7||c===12) newBoard[r][c] = 2; else newBoard[r][c] = memRevealed[r][c] ? memBoard[r][c] : 20; } if (!winner && turn !== 'WAIT' && cursor.r>=8 && cursor.r<=11 && cursor.c>=8 && cursor.c<=11) newBoard[cursor.r][cursor.c] = 3; } else if (selectedIndex === 6) { for(let i=5; i<=14; i++) { newBoard[5][i]=2; newBoard[14][i]=2; newBoard[i][5]=2; newBoard[i][14]=2; } for(let r=0; r<8; r++) { for(let c=0; c<8; c++) { let val = m3Board[r][c]; if (m3Selected && m3Selected.r === r && m3Selected.c === c) val += 50; if (!winner && turn !== 'WAIT' && cursor.r === r+6 && cursor.c === c+6) val += 100; newBoard[r+6][c+6] = val; } } } } setBoard(newBoard); }, [appState, selectedIndex, cursor, tttBoard, caroBoard, drawBoard, snake, food, memBoard, memRevealed, m3Board, m3Selected, winner, turn]);

  let bMinR=0, bMaxR=ROWS-1, bMinC=0, bMaxC=COLS-1; if(selectedIndex===0){bMaxR=2;bMaxC=2;} else if(selectedIndex===5){bMinR=8;bMaxR=11;bMinC=8;bMaxC=11;} else if(selectedIndex===6){bMinR=6;bMaxR=13;bMinC=6;bMaxC=13;}
  const handleLeft = () => { if(showLoadModal || showRatingModal || showRankModal) return; if(appState==="MENU")setSelectedIndex(p=>(p===0?GAMES.length-1:p-1)); else if(selectedIndex===4&&snakeDir!=="RIGHT")setSnakeDir("LEFT"); else if(!winner&&turn!=='WAIT'&&selectedIndex!==4)setCursor(p=>({...p,c:Math.max(bMinC,p.c-1)})); };
  const handleRight = () => { if(showLoadModal || showRatingModal || showRankModal) return; if(appState==="MENU")setSelectedIndex(p=>(p===GAMES.length-1?0:p+1)); else if(selectedIndex===4&&snakeDir!=="LEFT")setSnakeDir("RIGHT"); else if(!winner&&turn!=='WAIT'&&selectedIndex!==4)setCursor(p=>({...p,c:Math.min(bMaxC,p.c+1)})); };
  const handleUp = () => { if(showLoadModal || showRatingModal || showRankModal) return; if(appState==="PLAYING"&&selectedIndex===4&&snakeDir!=="DOWN")setSnakeDir("UP"); else if(appState==="PLAYING"&&!winner&&turn!=='WAIT'&&selectedIndex!==4)setCursor(p=>({...p,r:Math.max(bMinR,p.r-1)})); };
  const handleDown = () => { if(showLoadModal || showRatingModal || showRankModal) return; if(appState==="PLAYING"&&selectedIndex===4&&snakeDir!=="UP")setSnakeDir("DOWN"); else if(appState==="PLAYING"&&!winner&&turn!=='WAIT'&&selectedIndex!==4)setCursor(p=>({...p,r:Math.min(bMaxR,p.r+1)})); };

  const handleEnter = () => {
    if(showLoadModal || showRatingModal || showRankModal) return;
    if (appState === "MENU") {
      setAppState("PLAYING"); setTurn('X'); setWinner(null); setTime(0); setScore(0); setIsGameOver(false);
      if (selectedIndex===0) { setTttBoard(Array(3).fill(null).map(()=>Array(3).fill(null))); setCursor({r:1,c:1}); } else if (selectedIndex===1 || selectedIndex===2) { setCaroBoard(Array(ROWS).fill(null).map(()=>Array(COLS).fill(null))); setCursor({r:9,c:9}); } else if (selectedIndex===3) { setDrawBoard(Array(ROWS).fill(0).map(()=>Array(COLS).fill(0))); setCursor({r:9,c:9}); } else if (selectedIndex===4) { setSnake([{r:10,c:10},{r:10,c:9},{r:10,c:8}]); setSnakeDir("RIGHT"); setFood({r:5,c:15}); } else if (selectedIndex===5) { let p=[10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17]; p.sort(()=>Math.random()-0.5); const nb=Array(ROWS).fill(0).map(()=>Array(COLS).fill(0)); let i=0; for(let r=8;r<=11;r++)for(let c=8;c<=11;c++)nb[r][c]=p[i++]; setMemBoard(nb); setMemRevealed(Array(ROWS).fill(false).map(()=>Array(COLS).fill(false))); setMemFlipped([]); setMemMatches(0); setCursor({r:8,c:8}); } else if (selectedIndex===6) { setM3Board(Array(8).fill(0).map(()=>Array(8).fill(0).map(()=>M3_COLORS[Math.floor(Math.random()*5)]))); setM3Selected(null); setCursor({r:9,c:9}); }
    } 
    else if (appState === "PLAYING" && !winner && !isGameOver) {
      if (selectedIndex===0 && turn==='X' && !tttBoard[cursor.r][cursor.c]) { const nb=[...tttBoard];nb[cursor.r][cursor.c]='X';setTttBoard(nb); const res=checkTttWinner(nb);setWinner(res);if(res==='X')setScore(100+Math.max(0,50-time));setTurn('O'); } else if ((selectedIndex===1||selectedIndex===2) && turn==='X' && !caroBoard[cursor.r][cursor.c]) { const nb=[...caroBoard];nb[cursor.r][cursor.c]='X';setCaroBoard(nb); const res=checkCaroWinner(nb,cursor.r,cursor.c,'X',selectedIndex===1?5:4);setWinner(res); if(res==='X')setScore(500+Math.max(0,300-time));setTurn('O'); } else if (selectedIndex===3) { const nb=[...drawBoard];const cr=nb[cursor.r][cursor.c]; nb[cursor.r][cursor.c]=cr===0?4:cr===4?5:cr===5?6:cr===6?7:0; setDrawBoard(nb); setScore(p=>p+1); } else if (selectedIndex===5 && turn==='X') { if (!memRevealed[cursor.r][cursor.c] && memFlipped.length<2) { const nr=memRevealed.map(r=>[...r]); nr[cursor.r][cursor.c]=true; setMemRevealed(nr); const nf=[...memFlipped,{r:cursor.r,c:cursor.c}]; setMemFlipped(nf); if (nf.length===2) { const [p1,p2]=nf; if(memBoard[p1.r][p1.c]===memBoard[p2.r][p2.c]){ setMemMatches(m=>m+1); setScore(s=>s+50); setMemFlipped([]); if(memMatches+1===8)setWinner('PLAYER'); } else { setTurn('WAIT'); setTimeout(()=>{ setMemRevealed(p=>{const r=p.map(x=>[...x]);r[p1.r][p1.c]=false;r[p2.r][p2.c]=false;return r;}); setMemFlipped([]); setTurn('X'); },800); } } } } else if (selectedIndex===6 && turn!=='WAIT') { const mr = cursor.r - 6; const mc = cursor.c - 6; if (!m3Selected) { setM3Selected({r: mr, c: mc}); } else { if (m3Selected.r === mr && m3Selected.c === mc) { setM3Selected(null); } else if (Math.abs(m3Selected.r - mr) + Math.abs(m3Selected.c - mc) === 1) { let tb = m3Board.map(row => [...row]); let tmp = tb[m3Selected.r][m3Selected.c]; tb[m3Selected.r][m3Selected.c] = tb[mr][mc]; tb[mr][mc] = tmp; const {hasMatch} = findM3Matches(tb); if (hasMatch) { setM3Board(tb); setScore(s => s + 5); } else { alert("⚠️ BẠN KHÔNG THỂ ĐỔI CHỖ!"); } setM3Selected(null); } else { setM3Selected({r: mr, c: mc}); } } }
    }
  };

  // --- HÀM XỬ LÝ NÚT BACK (ĐÃ SỬA LỖI XÓA THÔNG BÁO THẮNG/THUA) ---
  const handleBack = () => { 
    if (showLoadModal) setShowLoadModal(false); 
    else if (showRatingModal) setShowRatingModal(false); 
    else if (showRankModal) setShowRankModal(false); 
    else if (appState === "PLAYING") {
      setAppState("MENU");
      setWinner(null);      // Xóa thông báo chiến thắng
      setIsGameOver(false); // Xóa thông báo thua cuộc
    }
  };

  const getCellClass = (val) => { if (val === 1) return `${GAMES[selectedIndex].color} ${GAMES[selectedIndex].shadow} scale-110`; if (val === 2) return `bg-slate-800`; if (val === 3) return `bg-amber-300 animate-ping shadow-[0_0_10px_rgba(252,211,77,1)]`; if (val === 4) return `bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] scale-110`; if (val === 5) return `bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] scale-110`; if (val === 6) return `bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] scale-110`; if (val === 9) return `bg-green-300 shadow-[0_0_8px_rgba(134,239,172,0.8)]`; if (val === 8) return `bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,1)] animate-pulse`; if (val === 7) return `bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] scale-110`; if (val === 20) return `bg-slate-600 shadow-md`; if (val >= 10 && val <= 17) { const colors = ['bg-pink-500','bg-cyan-500','bg-orange-500','bg-lime-500','bg-yellow-200','bg-indigo-500','bg-rose-600','bg-teal-300']; return `${colors[val-10]} shadow-inner scale-105`; } const m3Colors = { 30: "bg-red-500 shadow-md", 31: "bg-blue-500 shadow-md", 32: "bg-green-500 shadow-md", 33: "bg-yellow-400 shadow-md", 34: "bg-purple-500 shadow-md" }; if (val >= 30 && val <= 34) return m3Colors[val]; if (val >= 80 && val <= 84) return m3Colors[val - 50] + " animate-pulse scale-125 ring-2 ring-white"; if (val >= 130 && val <= 134) return m3Colors[val - 100] + " scale-125 ring-4 ring-amber-400"; if (val >= 180 && val <= 184) return m3Colors[val - 150] + " animate-pulse scale-125 ring-4 ring-white ring-offset-2"; return 'bg-slate-200 shadow-inner'; };

  return (
    <div className="flex flex-col items-center justify-center w-full my-4 relative">
      
      {/* 1. MODAL ĐÁNH GIÁ (RATING) */}
      {showRatingModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 rounded-3xl">
          <div className="bg-slate-800 border-2 border-slate-600 w-full max-w-md rounded-2xl shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Star className="text-amber-500" fill="currentColor"/> ĐÁNH GIÁ GAME</h2>
              <button onClick={() => setShowRatingModal(false)} className="text-slate-400 hover:text-white bg-slate-700 p-2 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={32} onClick={() => setMyStars(s)} className={`cursor-pointer transition-colors ${s <= myStars ? 'text-amber-400' : 'text-slate-600'}`} fill={s <= myStars ? 'currentColor' : 'none'} />
              ))}
            </div>
            <textarea value={myComment} onChange={e => setMyComment(e.target.value)} placeholder="Nhập bình luận của bạn..." className="w-full h-24 p-3 bg-slate-700 text-white rounded-lg outline-none mb-4 resize-none" />
            <button onClick={submitRating} className="w-full py-2 bg-amber-500 hover:bg-amber-600 font-bold text-white rounded-lg mb-6 shadow-md transition-colors">GỬI ĐÁNH GIÁ</button>

            <h3 className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-3">Cộng đồng nói gì?</h3>
            <div className="flex flex-col gap-3 max-h-40 overflow-y-auto custom-scrollbar">
              {ratingsList.length === 0 ? <p className="text-slate-500 text-center italic text-sm">Chưa có đánh giá nào.</p> : ratingsList.map(r => (
                <div key={r.id} className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-400 font-bold text-sm">{r.fullname || r.username}</span>
                    <span className="text-xs text-yellow-400 flex items-center gap-1">{r.stars} <Star size={10} fill="currentColor"/></span>
                  </div>
                  <p className="text-slate-300 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL BẢNG XẾP HẠNG (RANKING) */}
      {showRankModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 rounded-3xl">
          <div className="bg-slate-800 border-2 border-slate-600 w-full max-w-md rounded-2xl shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Trophy className="text-yellow-400" /> BẢNG XẾP HẠNG</h2>
              <button onClick={() => setShowRankModal(false)} className="text-slate-400 hover:text-white bg-slate-700 p-2 rounded-lg"><X size={20} /></button>
            </div>

            <div className="flex bg-slate-700 p-1 rounded-lg mb-4">
              <button onClick={() => handleOpenRanking("global")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${rankFilter === 'global' ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>TOÀN HỆ THỐNG</button>
              <button onClick={() => handleOpenRanking("friends")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${rankFilter === 'friends' ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>BẠN BÈ</button>
              <button onClick={() => handleOpenRanking("personal")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${rankFilter === 'personal' ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>CÁ NHÂN</button>
            </div>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
              {rankData.length === 0 ? <p className="text-slate-400 text-center italic py-4">Chưa có dữ liệu xếp hạng.</p> : rankData.map((row, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-black ${idx===0 ? 'text-yellow-400' : idx===1 ? 'text-slate-300' : idx===2 ? 'text-amber-700' : 'text-slate-500'}`}>#{idx + 1}</span>
                    <span className="text-white font-bold">{row.name || "Lần chơi " + (idx+1)}</span>
                  </div>
                  <span className="text-green-400 font-bold">{row.score} PTS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL TẢI GAME */}
      {showLoadModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 rounded-3xl">
          <div className="bg-slate-800 border-2 border-slate-600 w-full max-w-md rounded-2xl shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><FolderOpen className="text-amber-500" /> TẢI GAME ĐÃ LƯU</h2>
              <button onClick={() => setShowLoadModal(false)} className="text-slate-400 hover:text-white bg-slate-700 p-2 rounded-lg"><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {savedGames.length === 0 ? <p className="text-slate-400 text-center italic py-4">Bạn chưa lưu tiến độ game nào cả!</p> : savedGames.map((game) => (
                <button key={game.id} onClick={() => restoreGame(game)} className="flex justify-between items-center p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all border border-slate-600 hover:border-amber-500 group">
                  <div className="flex flex-col text-left"><span className="text-white font-bold group-hover:text-amber-400 transition-colors">{game.game_name}</span><span className="text-xs text-slate-400">Ngày lưu: {new Date(game.created_at).toLocaleString('vi-VN')}</span></div>
                  <div className="flex flex-col text-right"><span className="text-green-400 font-bold text-sm">Điểm: {game.score}</span><span className="text-amber-400 font-mono text-sm">{formatTime(game.play_time_seconds)}</span></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GIAO DIỆN GAME CHÍNH */}
      {appState === "PLAYING" && (
        <div className="flex justify-between items-center w-full max-w-sm mb-4 px-6 py-3 bg-slate-800 text-white rounded-2xl shadow-md border-2 border-slate-700">
          <div className="flex flex-col"><span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Thời gian</span><span className="text-xl font-mono text-amber-400 font-bold">{formatTime(time)}</span></div>
          <div className="flex flex-col text-right"><span className="text-xs text-slate-400 uppercase tracking-wider font-bold">ĐIỂM SỐ</span><span className="text-xl font-mono text-green-400 font-bold">{score}</span></div>
        </div>
      )}

      {(winner || isGameOver) && ( <div className={`mb-4 px-6 py-2 rounded-xl text-xl font-bold animate-bounce shadow-lg text-white ${isGameOver ? 'bg-red-600' : 'bg-green-600'}`}>{isGameOver ? "GAME OVER! RẮN ĐÃ CHẾT!" : `CHIẾN THẮNG!`}</div> )}

      <div className="bg-slate-50 p-6 rounded-3xl shadow-lg border border-slate-200">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {board.map((row, rIndex) => row.map((cell, cIndex) => (
              <div key={`${rIndex}-${cIndex}`} className={`w-4 h-4 rounded-full transition-all duration-200 ${getCellClass(cell)}`}></div>
          )))}
        </div>
      </div>

      <GameControls isPlaying={appState === "PLAYING"} onLeft={handleLeft} onRight={handleRight} onUp={handleUp} onDown={handleDown} onEnter={handleEnter} onBack={handleBack} onHelp={() => {}} />

      <p className="mt-6 text-sm font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full animate-pulse ${appState === "MENU" ? "bg-red-500" : "bg-green-500"}`}></span>
        {appState === "MENU" ? `SELECT GAME (${selectedIndex + 1}/${GAMES.length})` : `PLAYING: ${GAMES[selectedIndex].name}`}
      </p>

      {/* CÁC NÚT ĐÃ KÍCH HOẠT API ĐẦY ĐỦ */}
      <div className="flex flex-wrap justify-center gap-3 mt-6 max-w-md">
        <button onClick={handleSaveGame} disabled={isSaving || appState !== "PLAYING"} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-sm font-bold rounded-lg shadow-sm transition-colors"><Save size={16} className={isSaving ? "animate-spin" : ""} /> LƯU GAME</button>
        <button onClick={handleLoadList} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm transition-colors"><FolderOpen size={16} /> TẢI GAME</button>
        <button onClick={() => handleOpenRanking("global")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-yellow-600 text-sm font-bold rounded-lg shadow-sm transition-colors"><Trophy size={16} /> XẾP HẠNG</button>
        <button onClick={handleOpenRating} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-amber-600 text-sm font-bold rounded-lg shadow-sm transition-colors"><MessageSquare size={16} /> ĐÁNH GIÁ</button>
      </div>
    </div>
  );
}