import mongoose from 'mongoose';
import Resume from '../models/resume.model.js';
import ServerConfig from '../config/ServerConfig.js';

const migrateMarketplaceResumes = async () => {
  try {
    await mongoose.connect(ServerConfig.DB_URL);
    console.log('Connected to MongoDB');

    // Find resumes that are marketplace resumes but don't have isMarketplace flag
    const resumesWithoutFlag = await Resume.find({
      isMPUser: true,
      $or: [
        { isMarketplace: { $exists: false } },
        { isMarketplace: false }
      ]
    });

    console.log(`Found ${resumesWithoutFlag.length} marketplace resumes without isMarketplace flag`);

    if (resumesWithoutFlag.length > 0) {
      // Update all of them
      const result = await Resume.updateMany(
        {
          isMPUser: true,
          $or: [
            { isMarketplace: { $exists: false } },
            { isMarketplace: false }
          ]
        },
        {
          $set: { isMarketplace: true }
        }
      );

      console.log(`Updated ${result.modifiedCount} resumes with isMarketplace flag`);
    } else {
      console.log('No resumes found requiring migration.');
    }

    // Verify the migration
    const verificationCount = await Resume.countDocuments({
      isMPUser: true,
      isMarketplace: true
    });
    console.log(`Verification: ${verificationCount} resumes now have both isMPUser and isMarketplace flags`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

migrateMarketplaceResumes();

