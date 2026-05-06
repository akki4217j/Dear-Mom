import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameInvite, setGameInvite] = useState(null); // { sessionId, partnerName, puzzleTitle }
  const [pendingSessionId, setPendingSessionId] = useState(null); // session to auto-join

  useEffect(() => {
    if (!user?._id) {
      // Not logged in — disconnect if connected
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create global socket connection
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`🔌 [SocketContext] Connected with id: ${socket.id}`);
      setIsConnected(true);
      // Register this user so the server can map userId → socketId
      console.log(`📤 [SocketContext] Registering user: ${user._id}`);
      socket.emit('register-user', { userId: user._id });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [SocketContext] Disconnected`);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error(`❌ [SocketContext] Connection error:`, err.message);
    });

    // Listen for game invites from partner
    socket.on('game-invite', ({ sessionId, partnerName, puzzleTitle }) => {
      console.log(`🎮 [SocketContext] Received game-invite!`, { sessionId, partnerName, puzzleTitle });
      setGameInvite({ sessionId, partnerName, puzzleTitle });
      // Auto-dismiss after 20 seconds
      setTimeout(() => {
        setGameInvite(prev => {
          if (prev?.sessionId === sessionId) return null;
          return prev;
        });
      }, 20000);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user?._id]);

  const getSocket = useCallback(() => socketRef.current, []);

  const dismissInvite = useCallback(() => {
    setGameInvite(null);
  }, []);

  const acceptInvite = useCallback((sessionId) => {
    setPendingSessionId(sessionId);
    setGameInvite(null);
  }, []);

  const consumePendingSession = useCallback(() => {
    const id = pendingSessionId;
    setPendingSessionId(null);
    return id;
  }, [pendingSessionId]);

  const value = {
    socket: socketRef.current,
    getSocket,
    isConnected,
    gameInvite,
    dismissInvite,
    acceptInvite,
    pendingSessionId,
    consumePendingSession,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
      {/* Floating notification toast */}
      {gameInvite && (
        <GameInviteToast
          invite={gameInvite}
          onAccept={acceptInvite}
          onDismiss={dismissInvite}
        />
      )}
    </SocketContext.Provider>
  );
};

// ─── Game Invite Toast Notification ───
const GameInviteToast = ({ invite, onAccept, onDismiss }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isExiting, setIsExiting] = useState(false);

  const handleJoin = () => {
    onAccept(invite.sessionId);
    // Navigate to games page — the CoupleGames component will auto-load the session
    const path = user?.role === 'mom' ? '/mom/games' : '/partner/games';
    navigate(path);
  };

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(), 300);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        width: '92%',
        maxWidth: '400px',
        animation: isExiting
          ? 'toast-slide-out 0.3s ease-in forwards'
          : 'toast-slide-in 0.4s ease-out',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #fff1f2 0%, #fce7f3 50%, #f3e8ff 100%)',
          borderRadius: '20px',
          padding: '16px 18px',
          boxShadow: '0 8px 32px rgba(244, 63, 94, 0.2), 0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(244, 63, 94, 0.15)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {/* Animated puzzle icon */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: 'toast-pulse 2s infinite',
            }}
          >
            <span style={{ fontSize: '22px' }}>🧩</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 700,
                color: '#1f2937',
                lineHeight: 1.3,
              }}
            >
              {invite.partnerName} started a puzzle!
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '12px',
                color: '#9ca3af',
              }}
            >
              {invite.puzzleTitle || 'A new puzzle'} — play together! 💕
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.06)',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Join button */}
        <button
          onClick={handleJoin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            marginTop: '12px',
            padding: '10px 16px',
            borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          🎮 Join Now
        </button>
      </div>

      {/* Inline styles for animations */}
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-30px) scale(0.95); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes toast-slide-out {
          from { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          to { opacity: 0; transform: translateX(-50%) translateY(-30px) scale(0.95); }
        }
        @keyframes toast-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default SocketContext;
