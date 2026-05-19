import mongoose from 'mongoose';

// Stores liked baby names and couple quiz answers
const gameDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coupleId: {
    type: String,
    required: true,
    index: true,
  },
  likedNames: [{
    name: String,
    meaning: String,
    gender: String,
  }],
  quizAnswers: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// One game data record per user
gameDataSchema.index({ userId: 1 }, { unique: true });

const GameData = mongoose.model('GameData', gameDataSchema);
export default GameData;
