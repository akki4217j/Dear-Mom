import mongoose from 'mongoose';

const taskCompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
  },
  completedTasks: {
    type: Map,
    of: Boolean,
    default: {},
  },
}, {
  timestamps: true,
});

// One task completion record per user per day
taskCompletionSchema.index({ userId: 1, date: 1 }, { unique: true });

const TaskCompletion = mongoose.model('TaskCompletion', taskCompletionSchema);
export default TaskCompletion;
