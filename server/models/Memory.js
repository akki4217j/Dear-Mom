import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // coupleId groups memories for linked partners
  coupleId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Memory title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  milestone: {
    type: String,
    default: 'Special Moment',
  },
  photo: {
    type: String, // File path or URL
    default: '',
  },
}, {
  timestamps: true,
});

const Memory = mongoose.model('Memory', memorySchema);
export default Memory;
