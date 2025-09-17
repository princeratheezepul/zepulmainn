import mongoose from "mongoose";
import { MpUser } from "../models/mpuser.model.js";
import connectDB from "../config/dbConfig.js";

const createMpUser = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Check if user already exists
    const existingUser = await MpUser.findOne({ emailid: "test@gmail.com" });
    if (existingUser) {
      console.log("MP User already exists:", existingUser);
      return existingUser;
    }
    
    // Create new MP user
    const mpUser = new MpUser({
      firstName: "test",
      lastName: "user",
      DOB: new Date("2004-08-26"),
      emailid: "test@gmail.com",
      phone: "9384789467",
      userRole: "Manager",
      totalEarnings: 0,
      pendingEarnings: 0,
      transactions: [],
      accountDetails: [],
      bookmarkedJobs: []
    });
    
    const savedUser = await mpUser.save();
    console.log("MP User created successfully:", savedUser);
    return savedUser;
    
  } catch (error) {
    console.error("Error creating MP user:", error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
  }
};

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createMpUser()
    .then(() => {
      console.log("Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

export default createMpUser;
