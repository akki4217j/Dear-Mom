import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Puzzle from './models/Puzzle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Force Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const puzzles = [
  {
    title: 'Our Love Story 💕',
    imageUrl: '/uploads/puzzles/couple-illustration.png',
    gridSize: '4x4',
    category: 'couple',
    difficulty: 'easy',
  },
  {
    title: 'Baby Joy 👶',
    imageUrl: '/uploads/puzzles/baby-illustration.png',
    gridSize: '4x4',
    category: 'baby',
    difficulty: 'easy',
  },
  {
    title: 'Our Love Story (Hard) 💕',
    imageUrl: '/uploads/puzzles/couple-illustration.png',
    gridSize: '5x5',
    category: 'couple',
    difficulty: 'hard',
  },
  {
    title: 'Baby Joy (Hard) 👶',
    imageUrl: '/uploads/puzzles/baby-illustration.png',
    gridSize: '5x5',
    category: 'baby',
    difficulty: 'hard',
  },
];

const seedPuzzles = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing puzzles
    await Puzzle.deleteMany({});
    console.log('🗑️  Cleared existing puzzles');

    // Insert new puzzles
    const created = await Puzzle.insertMany(puzzles);
    console.log(`🧩 Seeded ${created.length} puzzles:`);
    created.forEach((p) => {
      console.log(`   - ${p.title} (${p.gridSize}, ${p.difficulty})`);
    });

    await mongoose.connection.close();
    console.log('✅ Done! MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedPuzzles();
