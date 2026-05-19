import mongoose from 'mongoose';
import dns from 'dns';

// Force Node.js to use Google DNS (fixes SRV lookup failures on some networks)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async (retries = 3) => {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`🔄 MongoDB connection attempt ${i}/${retries}...`);
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        family: 4, // Force IPv4
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ Attempt ${i} failed: ${error.message}`);
      if (i === retries) {
        console.error('❌ All connection attempts failed. Exiting...');
        process.exit(1);
      }
      // Wait 2 seconds before retrying
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};

export default connectDB;
