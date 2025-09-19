import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import ServerConfig from '../config/ServerConfig.js';

const updateUserAccessToMPDashboard = async () => {
  try {
    // Connect to MongoDB using the same config as your app
    await mongoose.connect(ServerConfig.DB_URL);
    console.log('Connected to MongoDB');

    // Update all users who don't have the accessToMPDashboard field
    const result = await User.updateMany(
      { accessToMPDashboard: { $exists: false } }, // Find users without this field
      { $set: { accessToMPDashboard: false } }     // Set default value to false
    );

    console.log(`Updated ${result.modifiedCount} users with accessToMPDashboard field`);
    
    // Optional: Update specific users to have access
    // Uncomment and modify as needed
    /*
    const specificUsers = await User.updateMany(
      { 
        email: { $in: ['admin@example.com', 'manager@example.com'] } // Add specific emails
      },
      { $set: { accessToMPDashboard: true } }
    );
    console.log(`Granted marketplace access to ${specificUsers.modifiedCount} specific users`);
    */

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
updateUserAccessToMPDashboard();
