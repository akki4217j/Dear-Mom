import TaskCompletion from '../models/Task.js';

// @desc    Get task completions for a date
// @route   GET /api/tasks/:date
export const getTasksByDate = async (req, res) => {
  try {
    const record = await TaskCompletion.findOne({
      userId: req.user._id,
      date: req.params.date,
    });

    res.json(record ? Object.fromEntries(record.completedTasks) : {});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Save task completions for a date
// @route   PUT /api/tasks/:date
export const saveTasksByDate = async (req, res) => {
  try {
    const { completedTasks } = req.body;

    const record = await TaskCompletion.findOneAndUpdate(
      { userId: req.user._id, date: req.params.date },
      { completedTasks },
      { new: true, upsert: true }
    );

    res.json(Object.fromEntries(record.completedTasks));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get weekly task stats
// @route   GET /api/tasks/stats/week
export const getWeeklyStats = async (req, res) => {
  try {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const records = await TaskCompletion.find({
      userId: req.user._id,
      date: { $in: dates },
    });

    const result = {};
    records.forEach(r => {
      result[r.date] = Object.fromEntries(r.completedTasks);
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task streak
// @route   GET /api/tasks/stats/streak
export const getTaskStreak = async (req, res) => {
  try {
    const { totalTasks } = req.query;
    const total = parseInt(totalTasks) || 7;
    
    let streak = 0;
    const today = new Date();

    for (let i = 0; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      
      const record = await TaskCompletion.findOne({ userId: req.user._id, date: key });
      
      if (record) {
        const completed = [...record.completedTasks.values()].filter(Boolean).length;
        if (completed >= total) {
          streak++;
        } else if (i > 0) { // Don't break on today if not all done yet
          break;
        }
      } else if (i > 0) {
        break;
      }
    }

    res.json({ streak });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
