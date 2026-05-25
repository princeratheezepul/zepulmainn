import mongoose from "mongoose";
import ServerConfig from "./ServerConfig.js";

const connectDB = async () => {
  try {
    await mongoose.connect(ServerConfig.DB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error?.message || "unknown error");
  }
};

export default connectDB;
