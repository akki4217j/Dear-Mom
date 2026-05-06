import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { puzzleAPI } from '../api/api';
import confetti from 'canvas-confetti';
import { ArrowLeft, Shuffle, Filter, Clock, Trophy, Users, Puzzle, RotateCcw, Link2, Check } from 'lucide-react';

// ─── VIEWS ───
const VIEW = { LIBRARY: 'library', WAITING: 'waiting', GAME: 'game', WIN: 'win' };

const PuzzleGame = ({ autoJoinSessionId, onAutoJoinConsumed }) => {
  const { user } = useAuth();
  const { getSocket } = useSocket();
  const [view, setView] = useState(VIEW.LIBRARY);
  const [session, setSession] = useState(null);

  // Auto-join from notification (partner accepting invite)
  useEffect(() => {
    if (autoJoinSessionId) {
      const load = async () => {
        try {
          const res = await puzzleAPI.getSession(autoJoinSessionId);
          setSession(res.data);
          // Partner accepts — go directly to GAME and emit join + accept
          setView(VIEW.GAME);
          const socket = getSocket();
          if (socket) {
            socket.emit('join-game', { sessionId: autoJoinSessionId, userId: user._id });
            socket.emit('accept-game', { sessionId: autoJoinSessionId, userId: user._id });
          }
        } catch (e) {
          console.error('Failed to auto-join session:', e);
        }
        if (onAutoJoinConsumed) onAutoJoinConsumed();
      };
      load();
    }
  }, [autoJoinSessionId]);

  // When wife starts a game → go to GAME directly
  const handleGameCreated = (sess) => {
    setSession(sess);
    setView(VIEW.GAME);
    // Join the socket room immediately so we can hear partner-joined
    const socket = getSocket();
    if (socket) {
      socket.emit('join-game', { sessionId: sess._id, userId: user._id });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {view === VIEW.LIBRARY && (
        <PuzzleLibrary
          user={user}
          onStartGame={handleGameCreated}
        />
      )}
      {view === VIEW.GAME && session && (
        <GameBoard
          user={user}
          session={session}
          setSession={setSession}
          onComplete={() => setView(VIEW.WIN)}
          onBack={() => setView(VIEW.LIBRARY)}
        />
      )}
      {view === VIEW.WIN && session && (
        <WinScreen
          session={session}
          onPlayAgain={() => { setSession(null); setView(VIEW.LIBRARY); }}
        />
      )}
    </div>
  );
};

// ─── PUZZLE LIBRARY ───
const PuzzleLibrary = ({ user, onStartGame }) => {
  const [puzzles, setPuzzles] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, sRes] = await Promise.all([puzzleAPI.getAll(), puzzleAPI.getSessions()]);
        setPuzzles(pRes.data);
        setSessions(sRes.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const startGame = async (puzzleId) => {
    setStarting(puzzleId);
    try {
      const res = await puzzleAPI.startGame(puzzleId);
      onStartGame(res.data);
    } catch (e) { console.error(e); alert('Failed to start game'); }
    setStarting(null);
  };

  const resumeGame = async (sessionId) => {
    setStarting(sessionId);
    try {
      const res = await puzzleAPI.getSession(sessionId);
      onStartGame(res.data);
    } catch (e) { console.error(e); }
    setStarting(null);
  };

  const randomPick = async () => {
    setStarting('random');
    try {
      const res = await puzzleAPI.getRandom(filter !== 'all' ? filter : undefined);
      await startGame(res.data._id);
    } catch (e) { console.error(e); alert('No puzzles found'); }
    setStarting(null);
  };

  const filtered = filter === 'all' ? puzzles : puzzles.filter(p => p.difficulty === filter);
  const activeSessions = sessions.filter(s => s.status === 'active');

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-40 rounded-2xl animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active sessions */}
      {activeSessions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
          <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Clock size={16} /> Continue Playing
          </h3>
          <div className="space-y-2">
            {activeSessions.map(s => {
              const placed = s.boardState ? Object.keys(s.boardState).length : 0;
              const pct = Math.round((placed / s.totalPieces) * 100);
              return (
                <button key={s._id} onClick={() => resumeGame(s._id)}
                  disabled={starting === s._id}
                  className="w-full flex items-center gap-3 bg-white/80 rounded-xl p-3 hover:bg-white transition text-left">
                  <img src={s.puzzleId?.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.puzzleId?.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-amber-600 font-medium">{pct}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters + Random */}
      <div className="flex items-center gap-2">
        {['all', 'easy', 'hard'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              filter === f
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                : 'bg-white text-gray-500 hover:bg-rose-50 border border-rose-100'
            }`}>
            {f === 'all' ? '✨ All' : f === 'easy' ? '🟢 Easy 4×4' : '🔴 Hard 5×5'}
          </button>
        ))}
        <button onClick={randomPick} disabled={!!starting}
          className="ml-auto px-3.5 py-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-xs font-medium hover:shadow-lg transition flex items-center gap-1.5">
          <Shuffle size={13} /> Random
        </button>
      </div>

      {/* Puzzle gallery */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(puzzle => (
          <button key={puzzle._id} onClick={() => startGame(puzzle._id)}
            disabled={starting === puzzle._id}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-rose-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left">
            <div className="relative aspect-square overflow-hidden">
              <img src={puzzle.imageUrl} alt={puzzle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  puzzle.difficulty === 'easy'
                    ? 'bg-green-400/90 text-white'
                    : 'bg-red-400/90 text-white'
                }`}>
                  {puzzle.gridSize}
                </span>
              </div>
              {starting === puzzle._id && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-gray-800 truncate">{puzzle.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 capitalize">{puzzle.category} • {puzzle.difficulty}</p>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <Puzzle size={40} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No puzzles found</p>
        </div>
      )}
    </div>
  );
};

// (WaitingForPartner removed as it's no longer needed)

// ─── GAME BOARD ───
const GameBoard = ({ user, session: initialSession, setSession, onComplete, onBack }) => {
  const [pieces, setPieces] = useState([]); // Canvas-cut piece images
  const [boardState, setBoardState] = useState({}); // { "r-c": { pieceIndex, placedBy } }
  const [myPieces, setMyPieces] = useState([]); // Piece indices assigned to me
  const [dragPiece, setDragPiece] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [recentSnap, setRecentSnap] = useState(null);
  const [recentBounce, setRecentBounce] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const { getSocket } = useSocket();
  const canvasRef = useRef(null);
  // Keep dragPiece in a ref too so the drop handler always has the latest value
  const dragPieceRef = useRef(null);

  const puzzle = initialSession.puzzleId;
  const sessionId = initialSession._id;
  const [rows, cols] = puzzle.gridSize.split('x').map(Number);
  const totalPieces = rows * cols;

  // Determine which player I am
  const isPlayer1 = initialSession.player1Id === user._id || initialSession.player1Id?._id === user._id;
  const myAssignedPieces = isPlayer1 ? initialSession.player1Pieces : initialSession.player2Pieces;

  const handleCopyLink = () => {
    const isMom = window.location.pathname.includes('/mom');
    const partnerPath = isMom ? '/partner/games' : '/mom/games';
    const joinLink = `${window.location.origin}${partnerPath}?join=${sessionId}`;
    
    navigator.clipboard.writeText(joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cut image into pieces using Canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const pw = img.width / cols;
      const ph = img.height / rows;
      const cutPieces = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = pw;
          canvas.height = ph;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, c * pw, r * ph, pw, ph, 0, 0, pw, ph);
          cutPieces.push({
            index: r * cols + c,
            row: r,
            col: c,
            dataUrl: canvas.toDataURL(),
          });
        }
      }
      setPieces(cutPieces);
    };
    img.src = puzzle.imageUrl;
  }, [puzzle.imageUrl, rows, cols]);

  // Restore board state from session
  useEffect(() => {
    if (initialSession.boardState) {
      const bs = typeof initialSession.boardState === 'object'
        ? (initialSession.boardState instanceof Map
            ? Object.fromEntries(initialSession.boardState)
            : initialSession.boardState)
        : {};
      setBoardState(bs);
      setMoveCount(initialSession.moves?.length || 0);
    }
    // Filter out already-placed pieces from my tray
    const placedIndices = new Set();
    if (initialSession.boardState) {
      const bs = initialSession.boardState instanceof Map
        ? Object.fromEntries(initialSession.boardState)
        : initialSession.boardState;
      Object.values(bs).forEach(v => placedIndices.add(v.pieceIndex));
    }
    setMyPieces(myAssignedPieces.filter(i => !placedIndices.has(i)));
  }, [initialSession]);

  // Socket.io — join game room & listen for real-time events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Join the puzzle game room (may already be joined from WAITING view, that's ok)
    socket.emit('join-game', { sessionId, userId: user._id });

    const handlePartnerJoined = () => setPartnerOnline(true);
    const handlePartnerLeft = () => setPartnerOnline(false);

    const handlePiecePlaced = ({ pieceIndex, row, col, placedBy, boardState: bs, moveCount: mc }) => {
      // Always sync board state from server (source of truth)
      setBoardState(bs);
      setMoveCount(mc);
      // Remove from my tray only if it was MY piece that was placed
      if (placedBy === user._id) {
        setMyPieces(prev => prev.filter(i => i !== pieceIndex));
      } else {
        // Partner placed a piece — show snap animation (own pieces already animated optimistically)
        setRecentSnap(`${row}-${col}`);
        setTimeout(() => setRecentSnap(null), 500);
      }
    };

    const handleGameComplete = () => {
      setIsComplete(true);
      setTimeout(() => onComplete(), 2000);
    };

    const handleMoveRejected = ({ reason, pieceIndex }) => {
      console.warn('Move rejected:', reason);
      // Rollback optimistic update — remove piece from board and add back to tray
      setBoardState(prev => {
        const updated = { ...prev };
        // Find and remove the rejected piece
        for (const key of Object.keys(updated)) {
          if (updated[key].pieceIndex === pieceIndex && updated[key].placedBy?.toString() === user._id) {
            delete updated[key];
            break;
          }
        }
        return updated;
      });
      setMyPieces(prev => prev.includes(pieceIndex) ? prev : [...prev, pieceIndex]);
    };

    socket.on('partner-joined', handlePartnerJoined);
    socket.on('partner-left', handlePartnerLeft);
    socket.on('piece-placed', handlePiecePlaced);
    socket.on('game-complete', handleGameComplete);
    socket.on('move-rejected', handleMoveRejected);

    return () => {
      // Clean up listeners but DON'T disconnect the global socket
      socket.off('partner-joined', handlePartnerJoined);
      socket.off('partner-left', handlePartnerLeft);
      socket.off('piece-placed', handlePiecePlaced);
      socket.off('game-complete', handleGameComplete);
      socket.off('move-rejected', handleMoveRejected);
    };
  }, [sessionId, user._id, getSocket]);

  // Handle drag start
  const handleDragStart = (e, pieceIndex) => {
    setDragPiece(pieceIndex);
    dragPieceRef.current = pieceIndex;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', pieceIndex.toString());
  };

  // Touch drag support
  const touchPieceRef = useRef(null);
  const touchCloneRef = useRef(null);

  const handleTouchStart = (e, pieceIndex) => {
    e.preventDefault();
    setDragPiece(pieceIndex);
    dragPieceRef.current = pieceIndex;
    touchPieceRef.current = pieceIndex;

    const touch = e.touches[0];
    const el = e.target.closest('.puzzle-piece');
    if (!el) return;
    const clone = el.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    clone.style.width = el.offsetWidth + 'px';
    clone.style.height = el.offsetHeight + 'px';
    clone.style.left = (touch.clientX - el.offsetWidth / 2) + 'px';
    clone.style.top = (touch.clientY - el.offsetHeight / 2) + 'px';
    clone.style.opacity = '0.85';
    clone.style.transform = 'scale(1.1)';
    clone.id = 'touch-drag-clone';
    document.body.appendChild(clone);
    touchCloneRef.current = clone;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touchCloneRef.current) {
      const el = touchCloneRef.current;
      el.style.left = (touch.clientX - el.offsetWidth / 2) + 'px';
      el.style.top = (touch.clientY - el.offsetHeight / 2) + 'px';
    }
    // Detect which cell we're over
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = target?.closest('[data-cell]');
    if (cell) {
      setDragOver(cell.dataset.cell);
    } else {
      setDragOver(null);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchCloneRef.current) {
      touchCloneRef.current.remove();
      touchCloneRef.current = null;
    }
    if (dragOver && touchPieceRef.current !== null) {
      const [r, c] = dragOver.split('-').map(Number);
      handleDrop(r, c, touchPieceRef.current);
    }
    setDragPiece(null);
    dragPieceRef.current = null;
    setDragOver(null);
    touchPieceRef.current = null;
  };

  // Handle drop on cell
  const handleDrop = (targetRow, targetCol, pieceIdx) => {
    const pieceIndex = pieceIdx !== undefined ? pieceIdx : dragPieceRef.current;
    if (pieceIndex === null || pieceIndex === undefined) return;

    const key = `${targetRow}-${targetCol}`;
    if (boardState[key]) return; // Already filled

    // Check if piece matches correct position
    const correctRow = Math.floor(pieceIndex / cols);
    const correctCol = pieceIndex % cols;

    if (targetRow === correctRow && targetCol === correctCol) {
      // Correct! Optimistically update the board immediately
      setBoardState(prev => ({
        ...prev,
        [key]: { pieceIndex, placedBy: user._id },
      }));
      setMyPieces(prev => prev.filter(i => i !== pieceIndex));

      // Snap animation
      setRecentSnap(key);
      setTimeout(() => setRecentSnap(null), 500);

      // Emit via socket for server persistence + partner sync
      const socket = getSocket();
      if (socket) {
        socket.emit('place-piece', {
          sessionId,
          pieceIndex,
          row: targetRow,
          col: targetCol,
          userId: user._id,
        });
      }
    } else {
      // Wrong slot — bounce animation
      setRecentBounce(key);
      setTimeout(() => setRecentBounce(null), 600);
    }
    setDragPiece(null);
    dragPieceRef.current = null;
    setDragOver(null);
  };

  const placedCount = Object.keys(boardState).length;
  const progress = Math.round((placedCount / totalPieces) * 100);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-rose-100 text-gray-400 hover:text-gray-600 transition">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 truncate">{puzzle.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-1.5 bg-rose-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[11px] text-rose-500 font-medium">{placedCount}/{totalPieces}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {partnerOnline && (
            <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Partner online
            </span>
          )}
        </div>
      </div>

      {/* Share Link Banner (Only show if partner is NOT online and game isn't done) */}
      {!partnerOnline && !isComplete && (
        <div className="bg-rose-50 rounded-xl p-3 flex items-center justify-between border border-rose-100">
          <div>
            <p className="text-xs font-semibold text-rose-800">Partner not here yet?</p>
            <p className="text-[10px] text-rose-600">Send them this link to join instantly</p>
          </div>
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              copied 
                ? 'bg-green-500 text-white shadow-sm' 
                : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            {copied ? <Check size={14} /> : <Link2 size={14} />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>
      )}

      {/* Game Board Grid */}
      <div className={`bg-white rounded-2xl p-3 shadow-sm border border-rose-50 ${isComplete ? 'animate-board-reveal' : ''}`}>
        <div className="grid gap-0.5 mx-auto" style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          maxWidth: '380px',
          aspectRatio: '1',
        }}>
          {Array.from({ length: totalPieces }).map((_, idx) => {
            const r = Math.floor(idx / cols);
            const c = idx % cols;
            const key = `${r}-${c}`;
            const filled = boardState[key];
            const piece = filled ? pieces.find(p => p.index === filled.pieceIndex) : null;

            return (
              <div
                key={key}
                data-cell={key}
                className={`puzzle-cell rounded-sm overflow-hidden aspect-square
                  ${dragOver === key ? 'drag-over' : ''}
                  ${filled ? 'filled' : ''}
                  ${recentSnap === key ? 'animate-piece-snap animate-piece-glow' : ''}
                  ${recentBounce === key ? 'animate-piece-bounce' : ''}
                `}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(key); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  // Read the piece index from dataTransfer — this is reliable across browsers
                  const pi = parseInt(e.dataTransfer.getData('text/plain'), 10);
                  handleDrop(r, c, isNaN(pi) ? undefined : pi);
                  setDragOver(null);
                }}
              >
                {piece ? (
                  <img src={piece.dataUrl} className="w-full h-full object-cover" alt="" draggable={false} />
                ) : (
                  <div className="w-full h-full bg-rose-50/50 flex items-center justify-center">
                    <span className="text-[10px] text-rose-200 font-medium">{r * cols + c + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Piece Tray */}
      {!isComplete && myPieces.length > 0 && (
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-rose-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-600">Your Pieces ({myPieces.length})</h4>
            <span className="text-[10px] text-gray-400">Drag to the board ↑</span>
          </div>
          <div className="piece-tray flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
            {myPieces.map(pieceIndex => {
              const piece = pieces.find(p => p.index === pieceIndex);
              if (!piece) return null;
              return (
                <div
                  key={pieceIndex}
                  className={`puzzle-piece rounded-lg overflow-hidden border-2 border-rose-100 cursor-grab active:cursor-grabbing ${dragPiece === pieceIndex ? 'dragging' : ''}`}
                  style={{ width: `${Math.min(70, 300 / cols)}px`, height: `${Math.min(70, 300 / cols)}px` }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, pieceIndex)}
                  onDragEnd={() => { setDragPiece(null); dragPieceRef.current = null; setDragOver(null); }}
                  onTouchStart={(e) => handleTouchStart(e, pieceIndex)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img src={piece.dataUrl} className="w-full h-full object-cover pointer-events-none" alt="" draggable={false} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All pieces placed message */}
      {!isComplete && myPieces.length === 0 && placedCount < totalPieces && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
          <p className="text-sm text-amber-700 font-medium">✅ You placed all your pieces!</p>
          <p className="text-xs text-amber-500 mt-1">Waiting for your partner to finish...</p>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400">
        <span className="flex items-center gap-1"><Trophy size={12} /> Moves: {moveCount}</span>
        <span className="flex items-center gap-1">🧩 {puzzle.gridSize}</span>
        <span className="flex items-center gap-1 capitalize">
          {puzzle.difficulty === 'easy' ? '🟢' : '🔴'} {puzzle.difficulty}
        </span>
      </div>
    </div>
  );
};

// ─── WIN SCREEN ───
const WinScreen = ({ session, onPlayAgain }) => {
  useEffect(() => {
    // Fire confetti
    const end = Date.now() + 3000;
    const fire = () => {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6, x: Math.random() }, colors: ['#f43f5e', '#ec4899', '#f97316', '#eab308', '#22c55e'] });
      if (Date.now() < end) requestAnimationFrame(fire);
    };
    fire();
  }, []);

  const puzzle = session.puzzleId;
  const totalMoves = session.moves?.length || 0;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="celebration-card bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-3xl p-8 shadow-lg border border-rose-100 text-center">
        <span className="text-6xl block mb-4">🎉</span>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Puzzle Complete!</h2>
        <p className="text-gray-500 text-sm mb-6">You two make a great team! 💕</p>

        <div className="bg-white/70 rounded-2xl p-4 mb-6 backdrop-blur-sm">
          <img src={puzzle?.imageUrl} alt={puzzle?.title} className="w-full rounded-xl shadow-md mb-3" />
          <p className="text-sm font-semibold text-gray-700">{puzzle?.title}</p>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-rose-500 animate-count">{totalMoves}</p>
            <p className="text-[11px] text-gray-400">Total Moves</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500 animate-count">{puzzle?.gridSize}</p>
            <p className="text-[11px] text-gray-400">Grid Size</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500 animate-count capitalize">{puzzle?.difficulty}</p>
            <p className="text-[11px] text-gray-400">Difficulty</p>
          </div>
        </div>

        <button onClick={onPlayAgain}
          className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:shadow-lg shadow-rose-200 transition flex items-center gap-2 mx-auto">
          <RotateCcw size={16} /> Play Another Puzzle
        </button>
      </div>
    </div>
  );
};

export default PuzzleGame;
