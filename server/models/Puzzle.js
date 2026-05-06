import mongoose from 'mongoose';

const puzzleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Puzzle title is required'],
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  gridSize: {
    type: String,
    enum: ['4x4', '5x5'],
    default: '4x4',
  },
  category: {
    type: String,
    enum: ['couple', 'baby', 'nature', 'family'],
    default: 'couple',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'hard'],
    default: 'easy',
  },
}, {
  timestamps: true,
});

const Puzzle = mongoose.model('Puzzle', puzzleSchema);
export default Puzzle;
