import express from "express";

import ServerConfig from "./config/ServerConfig.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import resumeRoutes from "./routes/resume.route.js";
import managerResumeRoutes from "./routes/manager.resume.route.js";
import adminResumeRoutes from "./routes/admin.resume.route.js";
import bulkUploadRoutes from "./routes/bulkUpload.route.js";
import connectDB from "./config/dbConfig.js";
import recruiterRoutes from "./routes/recruiter.route.js";
import managerRoutes from "./routes/manager.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import scorecardRoute from "./routes/scorecard.route.js";
import adminRoutes from "./routes/admin.route.js";
import accountmanagerRoutes from "./routes/accountmanager.route.js";
import zepdbRoutes from "./routes/zepdb.route.js";
import marketplaceRoutes from "./routes/marketplace.route.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import meetingRoutes from "./routes/meeting.route.js";
import { expireStaleMeetings } from "./services/meeting.service.js";
import { cleanupExpiredSessions } from "./utils/sessionManager.js";
const app = express();

// Debug environment variables
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// CORS configuration
const allowedOrigins = [
  ServerConfig.Frontend_URL,
  "http://localhost:5173",
  "https://zepulfullstack3.vercel.app",
  "https://zepul-fullstack-9hgn.vercel.app",
  "https://zepul.com",
  "https://www.zepul.com"
].filter(Boolean); // Remove any undefined values

console.log('CORS allowed origins:', allowedOrigins);
console.log('ServerConfig.Frontend_URL:', ServerConfig.Frontend_URL);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Explicit OPTIONS handler for preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cookieParser());

app.use("/api/resumes", resumeRoutes);
app.use("/api/manager/resumes", managerResumeRoutes);
app.use("/api/admin/resumes", adminResumeRoutes);
app.use("/api/resumes/bulk-upload", bulkUploadRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/company", companyRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/scorecard", scorecardRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/accountmanager", accountmanagerRoutes);
app.use("/api/zepdb", zepdbRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/meetings", meetingRoutes);
app.listen(ServerConfig.PORT, async () => {
  console.log(`Server started on port ${ServerConfig.PORT}...`);
});

connectDB();

// Set up periodic session cleanup (every hour)
setInterval(async () => {
  try {
    const cleanedCount = await cleanupExpiredSessions();
    if (cleanedCount > 0) {
      console.log(`Session cleanup: Removed ${cleanedCount} expired sessions`);
    }
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}, 60 * 60 * 1000); // Run every hour

// Set up periodic meeting expiry cleanup (every hour)
setInterval(async () => {
  try {
    const expired = await expireStaleMeetings();
    if (expired > 0) {
      console.log(`Meeting cleanup: expired ${expired} meetings`);
    }
  } catch (error) {
    console.error("Meeting cleanup error:", error);
  }
}, 60 * 60 * 1000);
