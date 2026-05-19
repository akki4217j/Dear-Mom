import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  label: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Ensure one mood entry per user per day
moodSchema.index({ userId: 1, date: 1 }, { unique: true });

const Mood = mongoose.model('Mood', moodSchema);
export default Mood;
