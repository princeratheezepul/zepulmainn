import { MpUser } from "../models/mpuser.model.js";
import { BankDetails } from "../models/bankDetails.model.js";
import { Job } from "../models/job.model.js";
import { MpJob } from "../models/mpjobs.model.js";
import { MpCompany } from "../models/mpcompany.model.js";
import Resume from "../models/resume.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { determineResumeTag } from "../utils/tagHelper.js";
import { createUserSession, invalidateUserSession } from "../utils/sessionManager.js";

// Generate JWT token for marketplace user with session ID
const generateMarketplaceToken = (userId, sessionId) => {
  return jwt.sign(
    { 
      userId,
      sessionId,
      type: 'marketplace'
    },
    process.env.ACCESS_TOKEN_SECRET || "marketplace_secret_key",
    { expiresIn: "24h" }
  );
};

// Register new marketplace user
export const marketplaceRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password, DOB, phone } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !DOB || !phone) {
      return res.status(400).json(
        new ApiResponse(400, null, "All fields are required")
      );
    }

    // Check if user already exists
    const existingUser = await MpUser.findOne({ emailid: email });
    if (existingUser) {
      return res.status(409).json(
        new ApiResponse(409, null, "User with this email already exists")
      );
    }

    // Create new MP user
    const mpUser = new MpUser({
      firstName,
      lastName,
      DOB: new Date(DOB),
      emailid: email,
      password,
      phone,
      userRole: "Manager", // Default role for marketplace users
      totalEarnings: 0,
      pendingEarnings: 0,
      transactions: [],
      accountDetails: [],
      bookmarkedJobs: [],
      pickedJobs: [],
      myJobs: []
    });
    
    const savedUser = await mpUser.save();
    
    // Create session and generate token
    const sessionData = await createUserSession(savedUser._id);
    const token = generateMarketplaceToken(savedUser._id, sessionData.sessionId);

    // Return user data without password
    const userData = {
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      emailid: savedUser.emailid,
      userRole: savedUser.userRole,
      totalEarnings: savedUser.totalEarnings,
      pendingEarnings: savedUser.pendingEarnings
    };

    res.status(201).json(
      new ApiResponse(201, {
        user: userData,
        token
      }, "User registered successfully")
    );
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Register new TalentScout user (recruiter role)
export const talentScoutRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password, DOB, phone } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !DOB || !phone) {
      return res.status(400).json(
        new ApiResponse(400, null, "All fields are required")
      );
    }

    // Check if user already exists
    const existingUser = await MpUser.findOne({ emailid: email });
    if (existingUser) {
      return res.status(409).json(
        new ApiResponse(409, null, "User with this email already exists")
      );
    }

    // Create new TalentScout user (recruiter role)
    const mpUser = new MpUser({
      firstName,
      lastName,
      DOB: new Date(DOB),
      emailid: email,
      password,
      phone,
      userRole: "recruiter", // TalentScout users get recruiter role
      totalEarnings: 0,
      pendingEarnings: 0,
      transactions: [],
      accountDetails: [],
      bookmarkedJobs: [],
      pickedJobs: [],
      myJobs: []
    });
    
    const savedUser = await mpUser.save();
    
    // Create session and generate token
    const sessionData = await createUserSession(savedUser._id);
    const token = generateMarketplaceToken(savedUser._id, sessionData.sessionId);

    // Return user data without password
    const userData = {
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      emailid: savedUser.emailid,
      userRole: savedUser.userRole,
      totalEarnings: savedUser.totalEarnings,
      pendingEarnings: savedUser.pendingEarnings
    };

    res.status(201).json(
      new ApiResponse(201, {
        user: userData,
        token
      }, "TalentScout user registered successfully")
    );
  } catch (error) {
    console.error("TalentScout registration error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Create TalentScout by Manager (adds to manager's recruiterList)
export const createTalentScoutByManager = async (req, res) => {
  try {
    const { firstName, lastName, email, DOB, phone, password } = req.body;
    const managerId = req.user.userId; // Get manager ID from auth middleware
    
    console.log("Creating talent scout by manager:", managerId);
    console.log("Talent scout data:", { firstName, lastName, email, DOB, phone });
    
    // Validate required fields
    if (!firstName || !lastName || !email || !DOB || !phone || !password) {
      return res.status(400).json(
        new ApiResponse(400, null, "All fields are required")
      );
    }

    // Verify the creator is a Manager
    const manager = await MpUser.findById(managerId);
    if (!manager) {
      return res.status(404).json(
        new ApiResponse(404, null, "Manager not found")
      );
    }

    if (manager.userRole !== "Manager") {
      return res.status(403).json(
        new ApiResponse(403, null, "Only users with Manager role can create talent scouts")
      );
    }

    // Check if user already exists
    const existingUser = await MpUser.findOne({ emailid: email });
    if (existingUser) {
      return res.status(409).json(
        new ApiResponse(409, null, "User with this email already exists")
      );
    }

    // Create new TalentScout user (recruiter role)
    const talentScout = new MpUser({
      firstName,
      lastName,
      DOB: new Date(DOB),
      emailid: email,
      password: password, // Use password from request
      phone,
      userRole: "recruiter", // Talent Scout users get recruiter role
      manager: managerId, // Set the manager reference
      totalEarnings: 0,
      pendingEarnings: 0,
      transactions: [],
      accountDetails: [],
      bookmarkedJobs: [],
      pickedJobs: [],
      myJobs: [],
      recruiterList: []
    });
    
    const savedTalentScout = await talentScout.save();
    console.log("Talent scout created:", savedTalentScout._id);

    // Add the talent scout to manager's recruiterList
    if (!manager.recruiterList.includes(savedTalentScout._id)) {
      manager.recruiterList.push(savedTalentScout._id);
      await manager.save();
      console.log("Talent scout added to manager's recruiterList");
    }

    // Return talent scout data without password
    const talentScoutData = {
      _id: savedTalentScout._id,
      firstName: savedTalentScout.firstName,
      lastName: savedTalentScout.lastName,
      emailid: savedTalentScout.emailid,
      phone: savedTalentScout.phone,
      DOB: savedTalentScout.DOB,
      userRole: savedTalentScout.userRole,
      manager: savedTalentScout.manager,
      totalEarnings: savedTalentScout.totalEarnings,
      pendingEarnings: savedTalentScout.pendingEarnings
    };

    res.status(201).json(
      new ApiResponse(201, {
        talentScout: talentScoutData,
        message: `Talent scout created successfully. Password has been generated and should be sent to ${email}`
      }, "Talent scout created successfully")
    );
  } catch (error) {
    console.error("Create talent scout by manager error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Create test MP user (for development)
export const createTestUser = async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await MpUser.findOne({ emailid: "test@gmail.com" });
    if (existingUser) {
      return res.status(200).json(
        new ApiResponse(200, { user: existingUser }, "Test user already exists")
      );
    }
    
    // Create new MP user
    const mpUser = new MpUser({
      firstName: "test",
      lastName: "user",
      DOB: new Date("2004-08-26"),
      emailid: "test@gmail.com",
      password: "test123", // This will be hashed by the pre-save middleware
      phone: "9384789467",
      userRole: "Manager",
      totalEarnings: 0,
      pendingEarnings: 0,
      transactions: [],
      accountDetails: [],
      bookmarkedJobs: []
    });
    
    const savedUser = await mpUser.save();
    res.status(201).json(
      new ApiResponse(201, { user: savedUser }, "Test user created successfully")
    );
    
  } catch (error) {
    console.error("Error creating test user:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Marketplace login
export const marketplaceLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email, password });
    console.log("MpUser model collection name:", MpUser.collection.name);

    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json(
        new ApiResponse(400, null, "Email and password are required")
      );
    }

    // Find user by email
    const user = await MpUser.findOne({ emailid: email });
    console.log("User found:", user ? "Yes" : "No");
    console.log("User data:", user ? {
      _id: user._id,
      emailid: user.emailid,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      firstName: user.firstName,
      lastName: user.lastName
    } : "No user found");
    
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json(
        new ApiResponse(401, null, "Invalid credentials")
      );
    }

    // Check if user has a password stored
    if (!user.password) {
      console.log("User has no password stored for email:", email);
      console.log("User object keys:", Object.keys(user.toObject()));
      return res.status(401).json(
        new ApiResponse(401, null, "Invalid credentials")
      );
    }

    // Check password using bcrypt
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      console.log("Password mismatch for email:", email);
      return res.status(401).json(
        new ApiResponse(401, null, "Invalid credentials")
      );
    }

    // Create session and generate token (this will invalidate any existing sessions)
    const sessionData = await createUserSession(user._id);
    const token = generateMarketplaceToken(user._id, sessionData.sessionId);

    // Return user data without sensitive information
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailid: user.emailid,
      userRole: user.userRole,
      totalEarnings: user.totalEarnings,
      pendingEarnings: user.pendingEarnings
    };

    res.status(200).json(
      new ApiResponse(200, {
        user: userData,
        token
      }, "Login successful")
    );

  } catch (error) {
    console.error("Marketplace login error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Marketplace logout
export const marketplaceLogout = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Invalidate the user's session
    await invalidateUserSession(userId);
    
    res.status(200).json(
      new ApiResponse(200, null, "Logged out successfully")
    );
  } catch (error) {
    console.error("Marketplace logout error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Validate session endpoint
export const validateSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = req.user.sessionId;
    
    // Session is already validated by middleware, just return success
    res.status(200).json(
      new ApiResponse(200, { 
        valid: true,
        userId: userId,
        sessionId: sessionId
      }, "Session is valid")
    );
  } catch (error) {
    console.error("Session validation error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Get marketplace user profile
export const getMarketplaceProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await MpUser.findById(userId).select('-__v');
    
    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found")
      );
    }

    res.status(200).json(
      new ApiResponse(200, { user }, "Profile retrieved successfully")
    );

  } catch (error) {
    console.error("Get marketplace profile error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Update marketplace user profile
export const updateMarketplaceProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, DOB, emailid, phone, userRole } = req.body;

    console.log("Updating marketplace profile for user:", userId);
    console.log("Update data:", { firstName, lastName, DOB, emailid, phone, userRole });
    console.log("Request body:", req.body);
    console.log("User from middleware:", req.user);

    // Check if user exists
    const user = await MpUser.findById(userId);
    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found")
      );
    }

    // Build update object with only provided fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (DOB !== undefined) {
      // Handle date parsing - frontend sends DD/MM/YYYY format
      if (DOB && typeof DOB === 'string' && DOB.includes('/')) {
        // Convert DD/MM/YYYY to YYYY-MM-DD for proper Date parsing
        const [day, month, year] = DOB.split('/');
        updateData.DOB = new Date(`${year}-${month}-${day}`);
      } else if (DOB) {
        updateData.DOB = new Date(DOB);
      } else {
        updateData.DOB = null;
      }
    }
    if (emailid !== undefined) updateData.emailid = emailid;
    if (phone !== undefined) updateData.phone = phone;
    if (userRole !== undefined) updateData.userRole = userRole;

    console.log("Update data object:", updateData);

    // Update user profile
    const updatedUser = await MpUser.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    console.log("Updated user:", updatedUser);

    if (!updatedUser) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found")
      );
    }

    console.log("Sending success response");
    res.status(200).json(
      new ApiResponse(200, { user: updatedUser }, "Profile updated successfully")
    );

  } catch (error) {
    console.error("Update marketplace profile error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json(
      new ApiResponse(500, null, `Internal server error: ${error.message}`)
    );
  }
};

// Save bank details for marketplace user
export const saveBankDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountHolderName, bankName, accountNumber, ifscCode } = req.body;

    console.log("Saving bank details for user:", userId);
    console.log("Bank details:", { accountHolderName, bankName, accountNumber, ifscCode });

    // Validate required fields
    if (!accountHolderName || !bankName || !accountNumber || !ifscCode) {
      return res.status(400).json(
        new ApiResponse(400, null, "All bank detail fields are required")
      );
    }

    // Check if user exists
    const user = await MpUser.findById(userId);
    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found")
      );
    }

    // Create new bank details
    const bankDetails = new BankDetails({
      accountHolderName,
      bankName,
      accountNumber: parseInt(accountNumber),
      ifscCode,
      mpuserId: userId
    });

    const savedBankDetails = await bankDetails.save();
    console.log("Bank details saved:", savedBankDetails._id);

    // Update user's accountDetails array
    user.accountDetails.push(savedBankDetails._id);
    await user.save();
    console.log("User accountDetails updated");

    // Return updated user data
    const updatedUser = await MpUser.findById(userId).select('-__v');
    
    res.status(200).json(
      new ApiResponse(200, { 
        user: updatedUser,
        bankDetails: savedBankDetails 
      }, "Bank details saved successfully")
    );

  } catch (error) {
    console.error("Save bank details error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Get all bank details for marketplace user
export const getMarketplaceBankDetails = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log("Fetching bank details for user:", userId);

    // Find all bank details for this user
    const bankDetails = await BankDetails.find({ mpuserId: userId }).sort({ createdAt: -1 });

    console.log("Found bank details:", bankDetails.length);

    res.status(200).json(
      new ApiResponse(200, { bankDetails }, "Bank details retrieved successfully")
    );

  } catch (error) {
    console.error("Get marketplace bank details error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Delete bank details for marketplace user
export const deleteMarketplaceBankDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bankDetailId } = req.params;

    console.log("Deleting bank details for user:", userId, "bankDetailId:", bankDetailId);

    // Check if bank detail exists and belongs to user
    const bankDetail = await BankDetails.findOne({ 
      _id: bankDetailId, 
      mpuserId: userId 
    });

    if (!bankDetail) {
      return res.status(404).json(
        new ApiResponse(404, null, "Bank detail not found")
      );
    }

    // Delete the bank detail
    await BankDetails.findByIdAndDelete(bankDetailId);

    // Remove from user's accountDetails array
    await MpUser.findByIdAndUpdate(
      userId,
      { $pull: { accountDetails: bankDetailId } },
      { new: true }
    );

    console.log("Bank detail deleted successfully");

    res.status(200).json(
      new ApiResponse(200, null, "Bank detail deleted successfully")
    );

  } catch (error) {
    console.error("Delete marketplace bank details error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Search jobs for marketplace
export const searchJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    console.log("Searching mpJobs for marketplace for user:", userId, "Query:", query, "Page:", page, "Limit:", limit);
    
    if (!query || query.trim() === '') {
      return res.status(400).json(
        new ApiResponse(400, null, "Search query is required")
      );
    }
    
    // Fetch user's bookmarked jobs
    const user = await MpUser.findById(userId).select('bookmarkedJobs');
    const bookmarkedJobIds = user?.bookmarkedJobs || [];
    
    // Create search conditions for mpJobs
    const searchConditions = {
      status: 'active',
      isClosed: false,
      $or: [
        { jobTitle: { $regex: query, $options: 'i' } },
        { jobDescription: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query, 'i')] } }
      ]
    };
    
    // Get total count of matching mpJobs
    const totalJobs = await MpJob.countDocuments(searchConditions);
    
    // Fetch paginated search results with populated company data
    const jobs = await MpJob.find(searchConditions)
      .populate('mpCompanies', 'companyName logo')
      .select('-internalNotes')
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`Found ${jobs.length} search results on page ${page} of ${Math.ceil(totalJobs / limit)}`);

    // Transform jobs data for marketplace display
    const transformedJobs = jobs.map(job => ({
      _id: job._id,
      title: job.jobTitle,
      company: job.mpCompanies && job.mpCompanies.length > 0 ? job.mpCompanies[0].companyName : 'Unknown Company',
      companyLogo: job.mpCompanies && job.mpCompanies.length > 0 ? job.mpCompanies[0].logo : '/api/placeholder/48/48',
      location: job.location || 'Not specified',
      type: job.jobType || 'Full-time',
      experience: job.experience ? 
        (job.experience.min && job.experience.max ? 
          `${job.experience.min}-${job.experience.max} years` :
          job.experience.min ? `${job.experience.min}+ years` :
          job.experience.max ? `Up to ${job.experience.max} years` : 'Not specified') 
        : 'Not specified',
      salary: job.salary ? 
        (job.salary.min && job.salary.max ? 
          `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}` : 
          job.salary.min ? `₹${job.salary.min.toLocaleString()}+` :
          job.salary.max ? `Up to ₹${job.salary.max.toLocaleString()}` : 'Not disclosed') 
        : 'Not disclosed',
      description: job.jobDescription || 'No description available',
      skills: job.skills || [],
      openPositions: 1, // Default for mpJobs
      priority: job.priority || 'Medium',
      workType: job.jobType || 'onsite',
      commissionRate: job.commissionRate || 0,
      postedDate: job.createdAt,
      hiringDeadline: job.hiringDeadline,
      totalApplications: job.totalApplications || 0,
      shortlisted: job.mpSelectedCandidates || 0,
      interviewed: job.totalInterviews || 0,
      totalHires: job.totalHires || 0,
      isBookmarked: (() => {
        const jobIdString = job._id.toString();
        const isBookmarked = bookmarkedJobIds.includes(jobIdString);
        if (isBookmarked) {
          console.log(`Job ${jobIdString} is bookmarked`);
        }
        return isBookmarked;
      })()
    }));

    res.status(200).json(
      new ApiResponse(200, { 
        jobs: transformedJobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalJobs / limit),
          totalJobs: totalJobs,
          jobsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(totalJobs / limit),
          hasPrevPage: parseInt(page) > 1
        },
        searchQuery: query
      }, "Search results fetched successfully")
    );

  } catch (error) {
    console.error("Search jobs error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Get all jobs for marketplace with pagination
export const getAllJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    console.log("Fetching mpJobs for marketplace for user:", userId, "Page:", page, "Limit:", limit);
    
    // Fetch user's bookmarked jobs
    const user = await MpUser.findById(userId).select('bookmarkedJobs');
    const bookmarkedJobIds = user?.bookmarkedJobs || [];
    console.log("User's bookmarked jobs:", bookmarkedJobIds);
    console.log("User's bookmarked jobs types:", bookmarkedJobIds.map(id => typeof id));
    
    // Get total count of active mpJobs
    const totalJobs = await MpJob.countDocuments({ status: 'active', isClosed: false });
    
    // Fetch paginated active mpJobs with populated company data
    const jobs = await MpJob.find({ status: 'active', isClosed: false })
      .populate('mpCompanies', 'companyName logo')
      .select('-internalNotes')
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    console.log(`Found ${jobs.length} active mpJobs on page ${page} of ${Math.ceil(totalJobs / limit)}`);
    
    // Debug: Log company data for first job
    if (jobs.length > 0) {
      console.log('Sample job company data:', {
        jobId: jobs[0]._id,
        mpCompanies: jobs[0].mpCompanies,
        companyName: jobs[0].mpCompanies && jobs[0].mpCompanies.length > 0 ? jobs[0].mpCompanies[0].companyName : 'No company'
      });
    }

    // Transform jobs data for marketplace display
    const transformedJobs = jobs.map(job => ({
      _id: job._id,
      title: job.jobTitle,
      company: job.mpCompanies && job.mpCompanies.length > 0 ? job.mpCompanies[0].companyName : 'Unknown Company',
      companyLogo: job.mpCompanies && job.mpCompanies.length > 0 ? job.mpCompanies[0].logo : '/api/placeholder/48/48',
      location: job.location || 'Not specified',
      type: job.jobType || 'Full-time',
      experience: job.experience ? 
        (job.experience.min && job.experience.max ? 
          `${job.experience.min}-${job.experience.max} years` :
          job.experience.min ? `${job.experience.min}+ years` :
          job.experience.max ? `Up to ${job.experience.max} years` : 'Not specified') 
        : 'Not specified',
      salary: job.salary ? 
        (job.salary.min && job.salary.max ? 
          `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}` : 
          job.salary.min ? `₹${job.salary.min.toLocaleString()}+` :
          job.salary.max ? `Up to ₹${job.salary.max.toLocaleString()}` : 'Not disclosed') 
        : 'Not disclosed',
      description: job.jobDescription || 'No description available',
      skills: job.skills || [],
      openPositions: 1, // Default for mpJobs
      priority: job.priority || 'Medium',
      workType: job.jobType || 'onsite',
      commissionRate: job.commissionRate || 0,
      postedDate: job.createdAt,
      hiringDeadline: job.hiringDeadline,
      totalApplications: job.totalApplications || 0,
      shortlisted: job.mpSelectedCandidates || 0,
      interviewed: job.totalInterviews || 0,
      totalHires: job.totalHires || 0,
      isBookmarked: (() => {
        const jobIdString = job._id.toString();
        const isBookmarked = bookmarkedJobIds.includes(jobIdString);
        if (isBookmarked) {
          console.log(`Job ${jobIdString} is bookmarked`);
        }
        return isBookmarked;
      })()
    }));

    res.status(200).json(
      new ApiResponse(200, { 
        jobs: transformedJobs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalJobs / limit),
          totalJobs: totalJobs,
          jobsPerPage: limit,
          hasNextPage: page < Math.ceil(totalJobs / limit),
          hasPrevPage: page > 1
        }
      }, "Jobs fetched successfully")
    );

  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Toggle bookmark for a job
export const toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.body;

    console.log("Toggling bookmark for user:", userId, "job:", jobId);

    if (!jobId) {
      return res.status(400).json(
        new ApiResponse(400, null, "Job ID is required")
      );
    }

    // Check if mpJob exists
    const job = await MpJob.findById(jobId);
    if (!job) {
      return res.status(404).json(
        new ApiResponse(404, null, "Job not found")
      );
    }

    // Get user and their bookmarked jobs
    const user = await MpUser.findById(userId);
    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found")
      );
    }

    const bookmarkedJobs = user.bookmarkedJobs || [];
    const jobIdString = jobId.toString();

    console.log("Current bookmarked jobs:", bookmarkedJobs);
    console.log("Job ID to toggle:", jobId);
    console.log("Job ID as string:", jobIdString);
    console.log("Is job already bookmarked?", bookmarkedJobs.includes(jobIdString));

    let isBookmarked;
    let updatedBookmarkedJobs;

    if (bookmarkedJobs.includes(jobIdString)) {
      // Remove bookmark
      updatedBookmarkedJobs = bookmarkedJobs.filter(id => id !== jobIdString);
      isBookmarked = false;
      console.log("Removing bookmark for job:", jobId);
      console.log("Updated bookmarked jobs after removal:", updatedBookmarkedJobs);
    } else {
      // Add bookmark
      updatedBookmarkedJobs = [...bookmarkedJobs, jobIdString];
      isBookmarked = true;
      console.log("Adding bookmark for job:", jobId);
      console.log("Updated bookmarked jobs after addition:", updatedBookmarkedJobs);
    }

    // Update user's bookmarked jobs
    user.bookmarkedJobs = updatedBookmarkedJobs;
    await user.save();

    console.log("Bookmark updated successfully. New bookmarked jobs:", updatedBookmarkedJobs.length);

    res.status(200).json(
      new ApiResponse(200, { 
        isBookmarked,
        bookmarkedJobs: updatedBookmarkedJobs
      }, isBookmarked ? "Job bookmarked successfully" : "Bookmark removed successfully")
    );

  } catch (error) {
    console.error("Toggle bookmark error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Get user's bookmarked jobs for "Your Picks" section
export const getBookmarkedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 8;
    
    console.log("Fetching bookmarked mpJobs for user:", userId, "Limit:", limit);
    
    // Fetch user's bookmarked jobs
    const user = await MpUser.findById(userId).select('bookmarkedJobs');
    const bookmarkedJobIds = user?.bookmarkedJobs || [];
    console.log("User's bookmarked job IDs:", bookmarkedJobIds);
    
    if (bookmarkedJobIds.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, { 
          jobs: [],
          total: 0
        }, "No bookmarked jobs found")
      );
    }
    
    // Fetch bookmarked mpJobs with populated company data
    const jobs = await MpJob.find({ 
      _id: { $in: bookmarkedJobIds },
      status: 'active', 
      isClosed: false 
    })
      .populate('mpCompanies', 'companyName logo')
      .select('-internalNotes')
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit);

    console.log(`Found ${jobs.length} bookmarked mpJobs`);

    // Transform jobs data for marketplace display
    const transformedJobs = jobs.map(job => ({
      _id: job._id,
      title: job.jobTitle,
      company: job.mpCompanies && job.mpCompanies.length > 0 ? job.mpCompanies[0].companyName : 'Unknown Company',
      companyLogo: job.mpCompanies && job.mpCompanies.length > 0 ? job.mpCompanies[0].logo : '/api/placeholder/48/48',
      location: job.location || 'Not specified',
      type: job.jobType || 'Full-time',
      experience: job.experience ? 
        (job.experience.min && job.experience.max ? 
          `${job.experience.min}-${job.experience.max} years` :
          job.experience.min ? `${job.experience.min}+ years` :
          job.experience.max ? `Up to ${job.experience.max} years` : 'Not specified') 
        : 'Not specified',
      salary: job.salary ? 
        (job.salary.min && job.salary.max ? 
          `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}` : 
          job.salary.min ? `₹${job.salary.min.toLocaleString()}+` :
          job.salary.max ? `Up to ₹${job.salary.max.toLocaleString()}` : 'Not disclosed') 
        : 'Not disclosed',
      description: job.jobDescription || 'No description available',
      skills: job.skills || [],
      openPositions: 1, // Default for mpJobs
      priority: job.priority || 'Medium',
      workType: job.jobType || 'onsite',
      commissionRate: job.commissionRate || 0,
      postedDate: job.createdAt,
      hiringDeadline: job.hiringDeadline,
      totalApplications: job.totalApplications || 0,
      shortlisted: job.mpSelectedCandidates || 0,
      interviewed: job.totalInterviews || 0,
      totalHires: job.totalHires || 0,
      isBookmarked: true // All these jobs are bookmarked
    }));

    res.status(200).json(
      new ApiResponse(200, { 
        jobs: transformedJobs,
        total: transformedJobs.length
      }, "Bookmarked jobs fetched successfully")
    );

  } catch (error) {
    console.error("Get bookmarked jobs error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Get single job details for marketplace
export const getJobDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.params;
    
    console.log("Fetching mpJob details for job:", jobId, "user:", userId);
    
    // Fetch user's bookmarked jobs to check if this job is bookmarked
    const user = await MpUser.findById(userId).select('bookmarkedJobs');
    const bookmarkedJobIds = user?.bookmarkedJobs || [];
    
    // Fetch the specific mpJob with populated company data
    const job = await MpJob.findById(jobId)
      .populate('mpCompanies', 'companyName logo')
      .select('-internalNotes');

    if (!job) {
      return res.status(404).json(
        new ApiResponse(404, null, "Job not found")
      );
    }

    if (job.status !== 'active' || job.isClosed) {
      return res.status(404).json(
        new ApiResponse(404, null, "Job is no longer available")
      );
    }

    console.log(`Found mpJob: ${job.jobTitle}`);

    // Transform job data for marketplace display
    const transformedJob = {
      _id: job._id,
      title: job.jobTitle,
      company: job.mpCompanies && job.mpCompanies.length > 0 ? job.mpCompanies[0].companyName : 'Unknown Company',
      companyLogo: job.mpCompanies && job.mpCompanies.length > 0 ? job.mpCompanies[0].logo : '/api/placeholder/48/48',
      location: job.location || 'Not specified',
      type: job.jobType || 'Full-time',
      experience: job.experience ? 
        (job.experience.min && job.experience.max ? 
          `${job.experience.min}-${job.experience.max} years` :
          job.experience.min ? `${job.experience.min}+ years` :
          job.experience.max ? `Up to ${job.experience.max} years` : 'Not specified') 
        : 'Not specified',
      salary: job.salary ? 
        (job.salary.min && job.salary.max ? 
          `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}` : 
          job.salary.min ? `₹${job.salary.min.toLocaleString()}+` :
          job.salary.max ? `Up to ₹${job.salary.max.toLocaleString()}` : 'Not disclosed') 
        : 'Not disclosed',
      description: job.jobDescription || 'No description available',
      skills: job.skills || [],
      openPositions: 1, // Default for mpJobs
      priority: job.priority || 'Medium',
      workType: job.jobType || 'onsite',
      commissionRate: job.commissionRate || 0,
      postedDate: job.createdAt,
      hiringDeadline: job.hiringDeadline,
      totalApplications: job.totalApplications || 0,
      shortlisted: job.mpSelectedCandidates || 0,
      interviewed: job.totalInterviews || 0,
      totalHires: job.totalHires || 0,
      isBookmarked: bookmarkedJobIds.includes(job._id.toString())
    };

    res.status(200).json(
      new ApiResponse(200, { 
        job: transformedJob
      }, "Job details fetched successfully")
    );

  } catch (error) {
    console.error("Get job details error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Pick a job for marketplace user
export const pickJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.body;

    console.log("Picking mpJob for user:", userId, "job:", jobId);

    if (!jobId) {
      return res.status(400).json(
        new ApiResponse(400, null, "Job ID is required")
      );
    }

    // Check if mpJob exists and is active
    const job = await MpJob.findById(jobId);
    if (!job) {
      return res.status(404).json(
        new ApiResponse(404, null, "Job not found")
      );
    }

    if (job.status !== 'active' || job.isClosed) {
      return res.status(400).json(
        new ApiResponse(400, null, "Job is no longer available")
      );
    }

    // Get user and their picked jobs
    const user = await MpUser.findById(userId);
    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found")
      );
    }

    const pickedJobs = user.pickedJobs || [];
    const jobObjectId = new mongoose.Types.ObjectId(jobId);

    // Check if job is already picked
    if (pickedJobs.some(pickedJob => pickedJob.toString() === jobId)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Job is already picked")
      );
    }

    // Add job to picked jobs
    user.pickedJobs.push(jobObjectId);
    await user.save();

    // Add user to job's licensePartners
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!job.licensePartners.includes(userObjectId)) {
      job.licensePartners.push(userObjectId);
      
      // Add to pickHistory for statistics
      job.pickHistory.push({
        userId: userObjectId,
        pickedAt: new Date()
      });
      
      // Increment pickedNumber for the job
      job.pickedNumber = (job.pickedNumber || 0) + 1;
      await job.save();
      console.log("User added to job's licensePartners and pickedNumber incremented");
    }

    // Increment pickedNumber for the company (first company in mpCompanies array)
    if (job.mpCompanies && job.mpCompanies.length > 0) {
      const companyId = job.mpCompanies[0];
      const company = await MpCompany.findById(companyId);
      if (company) {
        company.pickedNumber = (company.pickedNumber || 0) + 1;
        await company.save();
        console.log("Company pickedNumber incremented for company:", companyId);
      }
    }

    console.log("Job picked successfully. Total picked jobs:", user.pickedJobs.length);

    // Return updated user data
    const updatedUser = await MpUser.findById(userId).select('-__v');

    res.status(200).json(
      new ApiResponse(200, { 
        user: updatedUser,
        pickedJobs: user.pickedJobs
      }, "Job picked successfully")
    );

  } catch (error) {
    console.error("Pick job error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Withdraw a job for marketplace user
export const withdrawJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.body;

    console.log("Withdrawing job for user:", userId, "job:", jobId);

    if (!jobId) {
      return res.status(400).json(
        new ApiResponse(400, null, "Job ID is required")
      );
    }

    // Get user and their picked jobs
    const user = await MpUser.findById(userId);
    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found")
      );
    }

    const pickedJobs = user.pickedJobs || [];

    // Check if job is in picked jobs
    const jobIndex = pickedJobs.findIndex(pickedJob => pickedJob.toString() === jobId);
    if (jobIndex === -1) {
      return res.status(400).json(
        new ApiResponse(400, null, "Job is not in your picked jobs")
      );
    }

    // Remove job from picked jobs
    user.pickedJobs.splice(jobIndex, 1);
    await user.save();

    // Remove user from job's licensePartners
    const job = await MpJob.findById(jobId);
    if (job) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      job.licensePartners = job.licensePartners.filter(partnerId => 
        partnerId.toString() !== userId
      );
      
      // Decrement pickedNumber for the job
      job.pickedNumber = Math.max((job.pickedNumber || 0) - 1, 0);
      await job.save();
      console.log("User removed from job's licensePartners and pickedNumber decremented");
    }

    // Decrement pickedNumber for the company (first company in mpCompanies array)
    if (job && job.mpCompanies && job.mpCompanies.length > 0) {
      const companyId = job.mpCompanies[0];
      const company = await MpCompany.findById(companyId);
      if (company) {
        company.pickedNumber = Math.max((company.pickedNumber || 0) - 1, 0);
        await company.save();
        console.log("Company pickedNumber decremented for company:", companyId);
      }
    }

    console.log("Job withdrawn successfully. Total picked jobs:", user.pickedJobs.length);

    // Return updated user data
    const updatedUser = await MpUser.findById(userId).select('-__v');

    res.status(200).json(
      new ApiResponse(200, { 
        user: updatedUser,
        pickedJobs: user.pickedJobs
      }, "Job withdrawn successfully")
    );

  } catch (error) {
    console.error("Withdraw job error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// @desc Save resume for marketplace user
export const saveMarketplaceResume = async (req, res) => {
  try {
    console.log("Received request to save marketplace resume with jobId:", req.params.jobId);
    console.log("Resume data:", req.body);
    console.log("Marketplace User ID:", req.user.userId);
    
    const resumeData = req.body;
    const { jobId } = req.params;
    const userId = req.user.userId; // Get user ID from marketplace auth middleware

    if (!jobId) {
      return res.status(400).json(
        new ApiResponse(400, null, "JobId is required")
      );
    }

    if (!userId) {
      return res.status(400).json(
        new ApiResponse(400, null, "User ID is required")
      );
    }

    // Validate if jobId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid jobId format")
      );
    }

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid userId format")
      );
    }

    // Fetch job details to determine tag (use MpJob for marketplace)
    const job = await MpJob.findById(jobId);
    if (!job) {
      return res.status(404).json(
        new ApiResponse(404, null, "Job not found")
      );
    }

    // Determine tag based on job title and description
    const tag = determineResumeTag(job.jobTitle, job.jobDescription);
    console.log("Determined tag:", tag);

    // Create resume object for marketplace user
    const resumeObject = {
      jobId,
      tag,
      recruiterId: userId, // Store marketplace user ID in recruiterId field
      isMPUser: true, // Mark as marketplace user resume
      ...resumeData,
    };

    console.log("Resume object to save:", JSON.stringify(resumeObject, null, 2));

    const newResume = new Resume(resumeObject);

    console.log("Creating new marketplace resume document:", newResume);
    
    let saved;
    try {
      saved = await newResume.save();
      console.log("Marketplace resume saved successfully:", saved._id);
    } catch (saveError) {
      console.error("Error saving resume to database:", saveError);
      if (saveError.name === 'ValidationError') {
        console.error("Validation errors:", saveError.errors);
        return res.status(400).json(
          new ApiResponse(400, null, `Validation error: ${saveError.message}`)
        );
      }
      throw saveError;
    }

    // Increment totalApplications for the MpJob
    await MpJob.findByIdAndUpdate(jobId, { $inc: { totalApplications: 1 } });
    
    // Add resume to job's candidateList (for MpJob)
    try {
      const mpJob = await MpJob.findById(jobId);
      if (mpJob) {
        const resumeObjectId = new mongoose.Types.ObjectId(saved._id);
        if (!mpJob.candidateList.includes(resumeObjectId)) {
          mpJob.candidateList.push(resumeObjectId);
          await mpJob.save();
          console.log("Resume added to MpJob candidateList");
        }
      }
    } catch (mpJobError) {
      console.error("Error updating MpJob candidateList:", mpJobError);
      // Don't fail the request if this fails, just log the error
    }

    // Increment candidatesCount for the company (first company in mpCompanies array)
    try {
      const mpJob = await MpJob.findById(jobId);
      if (mpJob && mpJob.mpCompanies && mpJob.mpCompanies.length > 0) {
        const companyId = mpJob.mpCompanies[0];
        const company = await MpCompany.findById(companyId);
        if (company) {
          company.candidatesCount = (company.candidatesCount || 0) + 1;
          await company.save();
          console.log("Company candidatesCount incremented for company:", companyId);
        }
      }
    } catch (companyError) {
      console.error("Error updating MpCompany candidatesCount:", companyError);
      // Don't fail the request if this fails, just log the error
    }
    
    res.status(201).json(
      new ApiResponse(201, { resume: saved }, "Resume saved successfully")
    );
  } catch (err) {
    console.error("Error saving marketplace resume:", err);
    res.status(500).json(
      new ApiResponse(500, null, "Failed to save resume")
    );
  }
};

// @desc Save interview evaluation results for marketplace
export const saveMarketplaceInterviewEvaluation = async (req, res) => {
  try {
    console.log('saveMarketplaceInterviewEvaluation called with:', {
      resumeId: req.params.resumeId,
      body: req.body,
      headers: req.headers
    });

    const { resumeId } = req.params;
    const { evaluationResults, questions, answers, status } = req.body;
    const userId = req.user.userId; // Get user ID from marketplace auth middleware

    if (!resumeId) {
      console.log('Missing resumeId');
      return res.status(400).json(
        new ApiResponse(400, null, "Resume ID is required")
      );
    }

    if (!evaluationResults || !Array.isArray(evaluationResults)) {
      console.log('Invalid evaluationResults:', evaluationResults);
      return res.status(400).json(
        new ApiResponse(400, null, "Evaluation results are required")
      );
    }

    // Verify that the resume belongs to this marketplace user
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      console.log('Resume not found:', resumeId);
      return res.status(404).json(
        new ApiResponse(404, null, "Resume not found")
      );
    }

    if (resume.recruiterId.toString() !== userId.toString()) {
      console.log('Resume does not belong to user:', { resumeRecruiterId: resume.recruiterId, userId });
      return res.status(403).json(
        new ApiResponse(403, null, "Access denied: Resume does not belong to this user")
      );
    }

    console.log('Updating marketplace resume with evaluation data...');

    // Calculate score and totalscore
    const totalScore = evaluationResults.reduce((sum, result) => sum + (result.score || 0), 0);
    const totalQuestions = evaluationResults.length;
    const totalscore = totalQuestions * 10; // 10 points per question

    console.log('Calculated scores:', { totalScore, totalQuestions, totalscore });

    // Update resume with interview evaluation results, status, and scores
    const updatedResume = await Resume.findByIdAndUpdate(
      resumeId,
      {
        interviewEvaluation: {
          evaluationResults,
          questions,
          answers,
          evaluatedAt: new Date()
        },
        status: status || 'screening',
        score: totalScore,
        totalscore: totalscore
      },
      { new: true }
    );

    if (!updatedResume) {
      console.log('Resume not found after update:', resumeId);
      return res.status(404).json(
        new ApiResponse(404, null, "Resume not found")
      );
    }

    console.log('Marketplace interview evaluation saved successfully:', updatedResume._id);

    res.status(200).json(
      new ApiResponse(200, { 
        resume: updatedResume,
        evaluationSummary: {
          totalScore,
          totalQuestions,
          averageScore: totalQuestions > 0 ? (totalScore / totalQuestions).toFixed(2) : 0
        }
      }, "Interview evaluation saved successfully")
    );

  } catch (error) {
    console.error('Error saving marketplace interview evaluation:', error);
    res.status(500).json(
      new ApiResponse(500, null, "Failed to save interview evaluation")
    );
  }
};

// @desc Get candidates for a specific job by marketplace user
export const getMarketplaceCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId; // Get user ID from marketplace auth middleware

    console.log('Getting marketplace candidates for job:', jobId, 'user:', userId);

    if (!jobId) {
      return res.status(400).json(
        new ApiResponse(400, null, "Job ID is required")
      );
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid job ID")
      );
    }

    // Find all resumes for this job where recruiterId matches the marketplace user
    const candidates = await Resume.find({
      jobId: jobId,
      recruiterId: userId,
      isMPUser: true
    }).select('name email title experience location ats_score overallScore status createdAt interviewScheduled interviewEvaluation');

    console.log(`Found ${candidates.length} candidates for marketplace user ${userId} in job ${jobId}`);

    // Transform candidates data for frontend
    const transformedCandidates = candidates.map(candidate => ({
      _id: candidate._id,
      name: candidate.name || 'Unknown Candidate',
      email: candidate.email || 'No email provided',
      title: candidate.title || 'No title',
      experience: candidate.experience || 'Not specified',
      location: candidate.location || 'Not specified',
      score: candidate.overallScore || candidate.ats_score || 0,
      status: candidate.status || 'submitted',
      appliedDate: candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : 'Unknown',
      interviewScheduled: candidate.interviewScheduled || false,
      hasInterviewEvaluation: candidate.interviewEvaluation && candidate.interviewEvaluation.evaluationResults && candidate.interviewEvaluation.evaluationResults.length > 0
    }));

    res.status(200).json(
      new ApiResponse(200, { 
        candidates: transformedCandidates,
        totalCount: transformedCandidates.length
      }, "Candidates retrieved successfully")
    );

  } catch (error) {
    console.error('Error getting marketplace candidates:', error);
    res.status(500).json(
      new ApiResponse(500, null, "Failed to retrieve candidates")
    );
  }
};

// @desc Get individual resume details for marketplace user
export const getMarketplaceResumeDetails = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.userId; // Get user ID from marketplace auth middleware

    console.log('Getting marketplace resume details for resume:', resumeId, 'user:', userId);

    if (!resumeId) {
      return res.status(400).json(
        new ApiResponse(400, null, "Resume ID is required")
      );
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid resume ID")
      );
    }

    // Find the resume and verify ownership
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json(
        new ApiResponse(404, null, "Resume not found")
      );
    }

    // Verify that this resume belongs to the marketplace user
    if (resume.recruiterId.toString() !== userId.toString() || !resume.isMPUser) {
      return res.status(403).json(
        new ApiResponse(403, null, "Access denied. This resume does not belong to you.")
      );
    }

    console.log('Marketplace resume details retrieved successfully:', resume._id);

    res.status(200).json(
      new ApiResponse(200, resume, "Resume details retrieved successfully")
    );

  } catch (error) {
    console.error('Error getting marketplace resume details:', error);
    res.status(500).json(
      new ApiResponse(500, null, "Failed to retrieve resume details")
    );
  }
};

// Get user's picked jobs for "Jobs picked by you" section
export const getPickedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;
    
    console.log("Fetching picked mpJobs for user:", userId, "Limit:", limit);
    
    // Fetch user's picked jobs
    const user = await MpUser.findById(userId).select('pickedJobs');
    const pickedJobIds = user?.pickedJobs || [];
    console.log("User's picked job IDs:", pickedJobIds);
    
    if (pickedJobIds.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, { 
          jobs: [],
          total: 0
        }, "No picked jobs found")
      );
    }
    
    // Fetch picked mpJobs with populated company data
    const jobs = await MpJob.find({ 
      _id: { $in: pickedJobIds },
      status: 'active', 
      isClosed: false 
    })
      .populate('mpCompanies', 'companyName logo')
      .select('-internalNotes')
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit);

    console.log(`Found ${jobs.length} picked mpJobs`);

    // Transform jobs data for marketplace display
    const transformedJobs = jobs.map(job => ({
      _id: job._id,
      title: job.jobTitle,
      company: job.mpCompanies && job.mpCompanies.length > 0 ? job.mpCompanies[0].companyName : 'Unknown Company',
      companyLogo: job.mpCompanies && job.mpCompanies.length > 0 ? job.mpCompanies[0].logo : '/api/placeholder/48/48',
      location: job.location || 'Not specified',
      type: job.jobType || 'Full-time',
      experience: job.experience ? 
        (job.experience.min && job.experience.max ? 
          `${job.experience.min}-${job.experience.max} years` :
          job.experience.min ? `${job.experience.min}+ years` :
          job.experience.max ? `Up to ${job.experience.max} years` : 'Not specified') 
        : 'Not specified',
      salary: job.salary ? 
        (job.salary.min && job.salary.max ? 
          `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}` : 
          job.salary.min ? `₹${job.salary.min.toLocaleString()}+` :
          job.salary.max ? `Up to ₹${job.salary.max.toLocaleString()}` : 'Not disclosed') 
        : 'Not disclosed',
      description: job.jobDescription || 'No description available',
      skills: job.skills || [],
      openPositions: 1, // Default for mpJobs
      priority: job.priority || 'Medium',
      workType: job.jobType || 'onsite',
      commissionRate: job.commissionRate || 0,
      postedDate: job.createdAt,
      hiringDeadline: job.hiringDeadline,
      totalApplications: job.totalApplications || 0,
      shortlisted: job.mpSelectedCandidates || 0,
      interviewed: job.totalInterviews || 0,
      totalHires: job.totalHires || 0,
      isBookmarked: false, // We'll check this separately if needed
      status: job.priority === 'High' ? 'Urgent' : 
              job.priority === 'Medium' ? 'Active' : 'Open'
    }));

    res.status(200).json(
      new ApiResponse(200, { 
        jobs: transformedJobs,
        total: transformedJobs.length
      }, "Picked jobs fetched successfully")
    );

  } catch (error) {
    console.error("Get picked jobs error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Update marketplace resume (for red flag functionality)
export const updateMarketplaceResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { redFlagged, addedNotes } = req.body;
    const userId = req.userId; // Get user ID from marketplace auth middleware
    
    console.log('PATCH /api/marketplace/resumes/:resumeId called');
    console.log('resumeId:', resumeId);
    console.log('userId:', userId);
    console.log('req.body:', req.body);
    
    // Build update object
    const updateObj = {};
    if (typeof redFlagged === 'boolean') updateObj.redFlagged = redFlagged;
    if (addedNotes !== undefined) updateObj.addedNotes = addedNotes;
    
    if (Object.keys(updateObj).length === 0) {
      return res.status(400).json(
        new ApiResponse(400, null, "No valid fields to update")
      );
    }
    
    const updatedResume = await Resume.findByIdAndUpdate(
      resumeId,
      updateObj,
      { new: true }
    );
    
    if (!updatedResume) {
      return res.status(404).json(
        new ApiResponse(404, null, "Resume not found")
      );
    }

    // If redFlagged is being set to true, increment redFlagCount for MpJob and MpCompany
    if (redFlagged === true && updatedResume.jobId) {
      try {
        // Find the job to get its mpCompanies
        const job = await MpJob.findById(updatedResume.jobId);
        if (job) {
          // Increment redFlagCount for MpJob
          job.redFlagCount = (job.redFlagCount || 0) + 1;
          await job.save();
          console.log(`Incremented redFlagCount for MpJob ${updatedResume.jobId}`);

          // Increment redFlagCount for MpCompany (first company in mpCompanies array)
          if (job.mpCompanies && job.mpCompanies.length > 0) {
            const companyId = job.mpCompanies[0];
            const company = await MpCompany.findById(companyId);
            if (company) {
              company.redFlagCount = (company.redFlagCount || 0) + 1;
              await company.save();
              console.log(`Incremented redFlagCount for MpCompany ${companyId}`);
            }
          }
        }
      } catch (redFlagError) {
        console.error('Error incrementing redFlagCount:', redFlagError);
        // Don't fail the main request if this fails
      }
    }
    
    res.status(200).json(
      new ApiResponse(200, { resume: updatedResume }, "Resume updated successfully")
    );
    
  } catch (error) {
    console.error("Update marketplace resume error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};