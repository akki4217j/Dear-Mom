import GameData from '../models/GameData.js';

// Helper: get coupleId for a user
const getCoupleId = (user) => {
  if (user.linkedPartner) {
    const ids = [user._id.toString(), user.linkedPartner.toString()].sort();
    return ids.join('-');
  }
  return user._id.toString();
};

// Helper: get or create game data for user
const getOrCreateGameData = async (userId, coupleId) => {
  let gameData = await GameData.findOne({ userId });
  if (!gameData) {
    gameData = await GameData.create({ userId, coupleId, likedNames: [], quizAnswers: [] });
  }
  return gameData;
};

// @desc    Get liked baby names
// @route   GET /api/games/liked-names
export const getLikedNames = async (req, res) => {
  try {
    const coupleId = getCoupleId(req.user);
    const gameData = await getOrCreateGameData(req.user._id, coupleId);
    res.json(gameData.likedNames);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a liked baby name
// @route   POST /api/games/liked-names
export const addLikedName = async (req, res) => {
  try {
    const { name, meaning, gender } = req.body;
    const coupleId = getCoupleId(req.user);
    const gameData = await getOrCreateGameData(req.user._id, coupleId);

    gameData.likedNames.push({ name, meaning, gender });
    await gameData.save();

    res.json(gameData.likedNames);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get quiz answers for couple
// @route   GET /api/games/quiz-answers
export const getQuizAnswers = async (req, res) => {
  try {
    const coupleId = getCoupleId(req.user);
    
    // Get current user's answers
    const myData = await getOrCreateGameData(req.user._id, coupleId);
    
    // Get partner's answers if linked
    let partnerAnswers = [];
    if (req.user.linkedPartner) {
      const partnerData = await GameData.findOne({ userId: req.user.linkedPartner });
      if (partnerData) {
        partnerAnswers = partnerData.quizAnswers;
      }
    }

    res.json({
      myAnswers: myData.quizAnswers,
      partnerAnswers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Save quiz answers
// @route   POST /api/games/quiz-answers
export const saveQuizAnswers = async (req, res) => {
  try {
    const { answers } = req.body;
    const coupleId = getCoupleId(req.user);
    const gameData = await getOrCreateGameData(req.user._id, coupleId);

    gameData.quizAnswers = answers;
    await gameData.save();

    res.json({ message: 'Answers saved', answers: gameData.quizAnswers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset quiz answers
// @route   DELETE /api/games/quiz-answers
export const resetQuizAnswers = async (req, res) => {
  try {
    const gameData = await GameData.findOne({ userId: req.user._id });
    if (gameData) {
      gameData.quizAnswers = [];
      await gameData.save();
    }
    res.json({ message: 'Quiz answers reset' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
