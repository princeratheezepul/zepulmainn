import mongoose from 'mongoose';
import { MpUser } from '../models/mpuser.model.js';
import ServerConfig from '../config/ServerConfig.js';

const migrateCandidateData = async () => {
  try {
    // Connect to MongoDB using the same config as the main app
    await mongoose.connect(ServerConfig.DB_URL);
    console.log('Connected to MongoDB');

    // Find all users that don't have candidate_data field
    const usersWithoutCandidateData = await MpUser.find({
      $or: [
        { candidate_data: { $exists: false } },
        { candidate_data: null }
      ]
    });

    console.log(`Found ${usersWithoutCandidateData.length} users without candidate_data field`);

    if (usersWithoutCandidateData.length === 0) {
      console.log('No users need migration. All users already have candidate_data field.');
      return;
    }

    // Initialize candidate_data for all users that don't have it
    const updateResult = await MpUser.updateMany(
      {
        $or: [
          { candidate_data: { $exists: false } },
          { candidate_data: null }
        ]
      },
      {
        $set: {
          candidate_data: {
            applied: 0,
            hired: 0,
            interviewed: 0,
            shortlisted: 0
          }
        }
      }
    );

    console.log(`Migration completed successfully!`);
    console.log(`Updated ${updateResult.modifiedCount} users with candidate_data field`);

    // Verify the migration
    const remainingUsers = await MpUser.find({
      $or: [
        { candidate_data: { $exists: false } },
        { candidate_data: null }
      ]
    });

    console.log(`Verification: ${remainingUsers.length} users still without candidate_data field`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
migrateCandidateData();
