import Puzzle from '../models/Puzzle.js';
import PuzzleSession from '../models/PuzzleSession.js';

// Helper: get coupleId for a user (same pattern as gameController.js)
const getCoupleId = (user) => {
  if (user.linkedPartner) {
    const ids = [user._id.toString(), user.linkedPartner.toString()].sort();
    return ids.join('-');
  }
  return user._id.toString();
};

// Helper: shuffle array (Fisher-Yates)
const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// @desc    Get all puzzles (with optional filters)
// @route   GET /api/puzzles
export const getAllPuzzles = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const puzzles = await Puzzle.find(filter).sort({ createdAt: -1 });
    res.json(puzzles);
  } catch (error) {
    console.error('getAllPuzzles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a random puzzle
// @route   GET /api/puzzles/random
export const getRandomPuzzle = async (req, res) => {
  try {
    const { difficulty } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;

    const count = await Puzzle.countDocuments(filter);
    if (count === 0) {
      return res.status(404).json({ message: 'No puzzles found' });
    }

    const random = Math.floor(Math.random() * count);
    const puzzle = await Puzzle.findOne(filter).skip(random);
    res.json(puzzle);
  } catch (error) {
    console.error('getRandomPuzzle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Start a new game session
// @route   POST /api/puzzles/start-game
export const startGame = async (req, res) => {
  try {
    const { puzzleId } = req.body;
    const coupleId = getCoupleId(req.user);

    // Find the puzzle
    const puzzle = await Puzzle.findById(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    // Parse grid size
    const [rows, cols] = puzzle.gridSize.split('x').map(Number);
    const totalPieces = rows * cols;

    // Create array of piece indices and shuffle
    const allPieces = shuffleArray(Array.from({ length: totalPieces }, (_, i) => i));

    // Split pieces between players
    const mid = Math.ceil(totalPieces / 2);
    const player1Pieces = allPieces.slice(0, mid);
    const player2Pieces = allPieces.slice(mid);

    // Create the session
    const session = await PuzzleSession.create({
      puzzleId,
      coupleId,
      player1Id: req.user._id,
      player2Id: req.user.linkedPartner || null,
      player1Pieces,
      player2Pieces,
      boardState: new Map(),
      status: 'active',
      moves: [],
      totalPieces,
    });

    // Populate puzzle data before responding
    await session.populate('puzzleId');

    res.status(201).json(session);
  } catch (error) {
    console.error('startGame error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a game session (for resume)
// @route   GET /api/puzzles/session/:id
export const getSession = async (req, res) => {
  try {
    const session = await PuzzleSession.findById(req.params.id).populate('puzzleId');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify user belongs to this session
    const userId = req.user._id.toString();
    if (session.player1Id.toString() !== userId && session.player2Id?.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized for this session' });
    }

    res.json(session);
  } catch (error) {
    console.error('getSession error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all sessions for a couple
// @route   GET /api/puzzles/sessions
export const getSessions = async (req, res) => {
  try {
    const coupleId = getCoupleId(req.user);
    const sessions = await PuzzleSession.find({ coupleId })
      .populate('puzzleId')
      .sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('getSessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Place a puzzle piece (REST fallback — also handled by Socket.io)
// @route   POST /api/puzzles/session/:id/move
export const placeMove = async (req, res) => {
  try {
    const { pieceIndex, row, col } = req.body;
    const session = await PuzzleSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (session.status === 'done') {
      return res.status(400).json({ message: 'Game already completed' });
    }

    const key = `${row}-${col}`;

    // Check if slot already taken
    if (session.boardState.has(key)) {
      return res.status(400).json({ message: 'Slot already occupied' });
    }

    // Place the piece
    session.boardState.set(key, {
      pieceIndex,
      placedBy: req.user._id,
    });

    // Record the move
    session.moves.push({
      pieceIndex,
      row,
      col,
      playerId: req.user._id,
      timestamp: new Date(),
    });

    // Check if puzzle is complete
    if (session.boardState.size >= session.totalPieces) {
      session.status = 'done';
      session.completedAt = new Date();
    }

    await session.save();

    res.json({
      boardState: Object.fromEntries(session.boardState),
      status: session.status,
      completedAt: session.completedAt,
      moveCount: session.moves.length,
    });
  } catch (error) {
    console.error('placeMove error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
