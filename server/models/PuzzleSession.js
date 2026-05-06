import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema({
  pieceIndex: { type: Number, required: true },
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const puzzleSessionSchema = new mongoose.Schema({
  puzzleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle',
    required: true,
  },
  coupleId: {
    type: String,
    required: true,
    index: true,
  },
  player1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  player1Pieces: {
    type: [Number],
    default: [],
  },
  player2Pieces: {
    type: [Number],
    default: [],
  },
  // boardState: key is "row-col", value is { pieceIndex, placedBy }
  boardState: {
    type: Map,
    of: new mongoose.Schema({
      pieceIndex: Number,
      placedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }, { _id: false }),
    default: new Map(),
  },
  status: {
    type: String,
    enum: ['active', 'done'],
    default: 'active',
  },
  moves: {
    type: [moveSchema],
    default: [],
  },
  totalPieces: {
    type: Number,
    required: true,
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for quick lookup of active sessions per couple
puzzleSessionSchema.index({ coupleId: 1, status: 1 });

const PuzzleSession = mongoose.model('PuzzleSession', puzzleSessionSchema);
export default PuzzleSession;
