import mongoose from 'mongoose';
import { cleanupExpiredSessions } from '../utils/sessionManager.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const runSessionCleanup = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zepul');
    console.log('Connected to MongoDB');

    // Run cleanup
    const cleanedCount = await cleanupExpiredSessions();
    console.log(`Session cleanup completed. Cleaned ${cleanedCount} expired sessions.`);

    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Session cleanup failed:', error);
    process.exit(1);
  }
};

// Run cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSessionCleanup();
}

export default runSessionCleanup;
