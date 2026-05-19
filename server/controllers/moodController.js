import Mood from '../models/Mood.js';

// @desc    Get all moods for current user
// @route   GET /api/moods
export const getMoods = async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user._id }).sort({ date: 1 });
    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Save or update mood for a date
// @route   POST /api/moods
export const saveMood = async (req, res) => {
  try {
    const { date, value, label, emoji, note } = req.body;

    const mood = await Mood.findOneAndUpdate(
      { userId: req.user._id, date },
      { value, label, emoji, note },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(mood);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get mood stats (streak, average, distribution)
// @route   GET /api/moods/stats
export const getMoodStats = async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user._id }).sort({ date: -1 });

    if (moods.length === 0) {
      return res.json({
        totalDays: 0,
        avgMood: 0,
        bestStreak: 0,
        currentStreak: 0,
        distribution: [],
      });
    }

    // Average
    const avg = moods.reduce((s, m) => s + m.value, 0) / moods.length;

    // Current streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (moods.some(m => m.date === key)) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Best streak
    let bestStreak = 0, tempStreak = 0;
    const sorted = [...moods].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) { tempStreak = 1; }
      else {
        const prev = new Date(sorted[i - 1].date);
        const curr = new Date(sorted[i].date);
        const diff = (curr - prev) / 86400000;
        tempStreak = diff === 1 ? tempStreak + 1 : 1;
      }
      bestStreak = Math.max(bestStreak, tempStreak);
    }

    // Distribution
    const counts = [0, 0, 0, 0, 0];
    moods.forEach(m => { if (m.value >= 1 && m.value <= 5) counts[m.value - 1]++; });
    const labels = ['Great', 'Good', 'Okay', 'Low', 'Tough'];
    const distribution = labels.map((name, i) => ({ name, value: counts[i] })).filter(d => d.value > 0);

    res.json({
      totalDays: moods.length,
      avgMood: avg.toFixed(1),
      bestStreak,
      currentStreak,
      distribution,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get partner's moods (for partner dashboard)
// @route   GET /api/moods/partner
export const getPartnerMoods = async (req, res) => {
  try {
    const user = req.user;
    if (!user.linkedPartner) {
      return res.json([]);
    }

    // Get the linked partner (the mom)
    const moods = await Mood.find({ userId: user.linkedPartner }).sort({ date: -1 });
    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
