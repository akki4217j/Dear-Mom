import Memory from '../models/Memory.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: get coupleId for a user
const getCoupleId = async (user) => {
  if (user.linkedPartner) {
    // Use the smaller ObjectId as coupleId for consistency
    const ids = [user._id.toString(), user.linkedPartner.toString()].sort();
    return ids.join('-');
  }
  return user._id.toString();
};

// @desc    Get all memories for the couple
// @route   GET /api/memories
export const getMemories = async (req, res) => {
  try {
    const coupleId = await getCoupleId(req.user);
    const memories = await Memory.find({ coupleId }).sort({ date: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a memory
// @route   POST /api/memories
export const createMemory = async (req, res) => {
  try {
    const { title, description, date, milestone } = req.body;
    const coupleId = await getCoupleId(req.user);

    const memoryData = {
      userId: req.user._id,
      coupleId,
      title,
      description: description || '',
      date,
      milestone: milestone || 'Special Moment',
    };

    // If a file was uploaded
    if (req.file) {
      memoryData.photo = `/uploads/${req.file.filename}`;
    }

    const memory = await Memory.create(memoryData);
    res.status(201).json(memory);
  } catch (error) {
    console.error('Create memory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a memory
// @route   DELETE /api/memories/:id
export const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    const coupleId = await getCoupleId(req.user);
    if (memory.coupleId !== coupleId) {
      return res.status(403).json({ message: 'Not authorized to delete this memory' });
    }

    // Delete associated image file if exists
    if (memory.photo && memory.photo.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', memory.photo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Memory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Memory deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
