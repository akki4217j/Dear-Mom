import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import connectDB from './config/db.js';
import PuzzleSession from './models/PuzzleSession.js';
import User from './models/User.js';

// Route imports
import authRoutes from './routes/auth.js';
import moodRoutes from './routes/moods.js';
import taskRoutes from './routes/tasks.js';
import memoryRoutes from './routes/memories.js';
import gameRoutes from './routes/games.js';
import puzzleRoutes from './routes/puzzles.js';

// Config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Create HTTP server & Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Vite dev server
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/puzzles', puzzleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DearMom API is running 💕' });
});

// ─── Socket.io — User tracking & Puzzle Game Events ──────────
const onlineUsers = new Map(); // userId → Set<socketId>

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // ── Global user registration (for notifications anywhere in the app) ──
  socket.on('register-user', ({ userId }) => {
    socket.userId = userId;
    socket.join(`user-${userId}`); // Join personal notification room
    console.log(`👤 User ${userId} registered to personal room user-${userId}`);
  });

  // ── Player joins a game session room ──
  socket.on('join-game', async ({ sessionId, userId }) => {
    socket.join(`puzzle-${sessionId}`);
    socket.userId = userId;
    socket.sessionId = sessionId;
    console.log(`🧩 User ${userId} joined puzzle room: puzzle-${sessionId}`);

    // Notify others in the room that someone joined
    socket.to(`puzzle-${sessionId}`).emit('partner-joined', { userId });

    // Try to notify partner who isn't in the room yet
    try {
      const session = await PuzzleSession.findById(sessionId).populate('puzzleId');
      if (!session) {
        console.log(`❌ Session ${sessionId} not found in DB`);
        return;
      }

      console.log(`📌 Session found — player1Id: ${session.player1Id}, player2Id: ${session.player2Id}`);

      // Determine who the partner is
      const p1 = session.player1Id.toString();
      const p2 = session.player2Id?.toString();
      const partnerId = p1 === userId ? p2 : p1;

      console.log(`🔍 Current userId: "${userId}", player1Id: "${p1}", player2Id: "${p2}"`);
      console.log(`🔍 Resolved partnerId: "${partnerId}"`);

      if (!partnerId) {
        console.log(`❌ No partnerId resolved — player2Id is null`);
        return;
      }

      // Find current user's name for the notification
      const currentUser = await User.findById(userId).select('name');
      console.log(`👤 Inviter name: ${currentUser?.name || 'unknown'}`);

      // Send game-invite to partner's personal room
      io.to(`user-${partnerId}`).emit('game-invite', {
        sessionId,
        partnerName: currentUser?.name || 'Your partner',
        puzzleTitle: session.puzzleId?.title || 'A puzzle',
      });
      console.log(`✅ Game invite sent to partner ${partnerId} via room user-${partnerId}`);
    } catch (err) {
      console.error('Error sending game invite:', err);
    }
  });

  // ── Partner accepts game invite ──
  socket.on('accept-game', ({ sessionId, userId }) => {
    // Broadcast to the puzzle room so the waiting player knows partner accepted
    socket.to(`puzzle-${sessionId}`).emit('game-accepted', { userId });
    console.log(`✅ User ${userId} accepted game invite for session ${sessionId}`);
  });

  // ── Player places a piece ──
  socket.on('place-piece', async ({ sessionId, pieceIndex, row, col, userId }) => {
    try {
      const session = await PuzzleSession.findById(sessionId);
      if (!session || session.status === 'done') return;

      const key = `${row}-${col}`;

      // Check if slot already taken
      if (session.boardState.has(key)) {
        socket.emit('move-rejected', { reason: 'Slot already occupied', pieceIndex });
        return;
      }

      // Place the piece
      session.boardState.set(key, {
        pieceIndex,
        placedBy: userId,
      });

      // Record the move
      session.moves.push({
        pieceIndex,
        row,
        col,
        playerId: userId,
        timestamp: new Date(),
      });

      // Check if puzzle is complete
      let isComplete = false;
      if (session.boardState.size >= session.totalPieces) {
        session.status = 'done';
        session.completedAt = new Date();
        isComplete = true;
      }

      await session.save();

      // Broadcast to all players in the room (including sender for confirmation)
      io.to(`puzzle-${sessionId}`).emit('piece-placed', {
        pieceIndex,
        row,
        col,
        placedBy: userId,
        boardState: Object.fromEntries(session.boardState),
        moveCount: session.moves.length,
      });

      // If complete, emit game-complete event
      if (isComplete) {
        io.to(`puzzle-${sessionId}`).emit('game-complete', {
          completedAt: session.completedAt,
          totalMoves: session.moves.length,
        });
      }
    } catch (error) {
      console.error('Socket place-piece error:', error);
      socket.emit('move-rejected', { reason: 'Server error', pieceIndex });
    }
  });

  // ── Disconnect cleanup ──
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);

    // Socket.io automatically handles room removals on disconnect


    // Notify puzzle room
    if (socket.sessionId) {
      socket.to(`puzzle-${socket.sessionId}`).emit('partner-left', { userId: socket.userId });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum 10MB allowed.' });
    }
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 DearMom API running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}/api/health`);
  console.log(`🧩 Socket.io ready for puzzle games`);
});
