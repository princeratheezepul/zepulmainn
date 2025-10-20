import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs';
import { Job } from '../models/job.model.js';
import Recruiter from '../models/recruiter.model.js';
import { Company } from '../models/company.model.js';
import { Admin } from '../models/admin.model.js';
import { MpCompany } from '../models/mpcompany.model.js';
import { MpJob } from '../models/mpjobs.model.js';
import Resume from '../models/resume.model.js';
import { MpUser } from '../models/mpuser.model.js';
import mongoose from 'mongoose';
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
        return { message: "Something went wrong" };
    }
}

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use SMTP config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeManagerEmail = async (toEmail, adminName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'You have been added as a Manager',
    html: `
      <p>Hello,</p>
      <p>You have been added as a manager by admin <strong>${adminName}</strong>.</p>
      <p>Please login to your account using your credentials.</p>
    `,
  };
  console.log(mailOptions)
  await transporter.sendMail(mailOptions);
};

const registerUser = async (req, res) => {
    try {
        console.log("request received");
        console.log(req.body);
        const { fullname, email, password,adminId } = req.body;
        console.log(req.body);
        const username = fullname.replace(/\s+/g, '').toLowerCase();
        console.log(username, password);

        const existingUser = await User.findOne({ $or: [{ username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const user = await User.create({ username, fullname, email, password,adminId });
        const admin = await Admin.findById(adminId);
        console.log(admin);
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            return res.status(500).json({ message: "Something went wrong" });
        }
    if(admin) await sendWelcomeManagerEmail(email, admin.fullname);

        return res.status(201).json({
            status: 201,
            message: "User created successfully",
            data: createdUser
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);
        console.log(email, password);

        if (!email) {
            return res.status(400).json({ message: "Enter email" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found. Please check the email." });
        }

        // Check if user is disabled
        if (user.status === 'disabled') {
            return res.status(403).json({ message: "You are disabled to get access" });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password. Try again." });
        }
        console.log("id", user._id);
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        console.log("Generated Access Token: ", accessToken);
        console.log("Generated Refresh Token: ", refreshToken);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        };

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                status: 200,
                message: "User logged in successfully",
                data: { user: loggedInUser, accessToken, refreshToken }
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const logoutUser = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(400).json({ message: "No token found, please log in again." });
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            path: "/",
        };

        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                status: 200,
                message: "User logged out successfully",
                data: {}
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id);

        if (!user) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({ message: "Refresh token is expired or used" });
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({
                status: 200,
                message: "Access token refreshed",
                data: { accessToken, refreshToken: newRefreshToken }
            });
    } catch (error) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
}

const getManagerInfo = async (req, res) => {
  try {
    const managerId = req.params.managerId;
    console.log('Manager ID:', managerId);

    const manager = await User.findById(managerId);
    if (!manager) return res.status(404).json({ error: 'Manager not found' });

    const company = await Company.findOne({ userId: managerId });
    const jobs = await Job.find({managerId })
      .populate('adminId', 'fullname username')
      .populate('managerId', 'fullname username')
      .populate('assignedRecruiters', 'fullname email status');
    const recruiters = await Recruiter.find({ userId: managerId });

    res.json({
      manager,
      company,
      jobs,
      recruiters,
    });
  } catch (err) {
    console.error('Error in getManagerInfo:', err);
    res.status(500).json({ error: 'Server error' });
  }
};




const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
    const managerId = req.user.id;
  
    try {
      const manager = await User.findById(managerId);
      if (!manager) return res.status(404).json({ error: 'Admin not found' });
  
      const isMatch = await bcrypt.compare(oldPassword, manager.password);
      if (!isMatch) return res.status(400).json({ error: 'Incorrect old password' });
  
      manager.password = newPassword; // Let the pre-save hook handle hashing
      await manager.save();
  
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
};

const forgotpassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ Status: "User not existed", message: "No account found with this email address" });
        }

        // Generate reset token
        const resetToken = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "1d" });
        
        // Save reset token and expiry to user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `http://localhost:5173/manager/reset_password/${user._id}/${resetToken}`;
        
        // Console log the URL for testing
        console.log('Password reset URL:', resetUrl);
        console.log('Sending reset email to:', user.email);

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Reset Password Link',
            text: `Click the following link to reset your password: ${resetUrl}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('Email error:', error);
                return res.status(500).json({ Status: "Error", message: "Failed to send email" });
            } else {
                return res.json({ Status: "Success", message: "Password reset email sent successfully" });
            }
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ Status: "Error", message: "Internal server error" });
    }
}


const resetpassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        // Find user and verify token
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ Status: "Error", message: "User not found" });
        }

        // Check if reset token matches and is not expired
        if (user.resetPasswordToken !== token) {
            return res.status(400).json({ Status: "Error", message: "Invalid reset token" });
        }

        if (user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ Status: "Error", message: "Reset token has expired" });
        }

        // Verify JWT token
        jwt.verify(token, "jwt_secret_key", async (err, decoded) => {
            if (err) {
                return res.status(400).json({ Status: "Error", message: "Invalid or expired token" });
            }

            try {
                // First clear the reset token fields
                await User.findByIdAndUpdate(
                    user._id,
                    {
                        $unset: {
                            resetPasswordToken: 1,
                            resetPasswordExpires: 1
                        }
                    },
                    { runValidators: false }
                );

                // Then update the password using save to trigger the pre-save hook
                user.password = password;
                await user.save({ validateBeforeSave: false });

                return res.json({ Status: "Success", message: "Password reset successfully" });
            } catch (updateError) {
                console.error('Password update error:', updateError);
                return res.status(500).json({ Status: "Error", message: "Failed to update password" });
            }
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ Status: "Error", message: "Internal server error" });
    }
}

const changeEmailRequest = async (req, res) => {
    const { currentEmail, newEmail } = req.body;

    try {
        const user = await User.findOne({ email: currentEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found with current email" });
        }

        const token = jwt.sign({ id: user._id, newEmail }, "jwt_secret_key", { expiresIn: "1d" });

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: newEmail,
            subject: 'Confirm Email Change',
            text: `http://localhost:5173/manager/change-email/${user._id}/${token}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error("Error sending mail:", error);
                return res.status(500).json({ message: "Error sending email" });
            } else {
                return res.status(200).json({ message: "Verification email sent to new address" });
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const changeEmail = async (req, res) => {
    const { id, token } = req.params;

    try {
        jwt.verify(token, "jwt_secret_key", async (err, decoded) => {
            if (err) {
                console.error("JWT verification failed:", err.message);
                return res.status(400).json({ message: "Invalid or expired token" });
            }

            const { newEmail } = decoded;

            const existingUser = await User.findOne({ email: newEmail });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }

            await User.findByIdAndUpdate(id, { email: newEmail });
            return res.status(200).json({ message: "Email updated successfully" });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export { loginUser, logoutUser, registerUser, forgotpassword, resetpassword, changeEmail, changeEmailRequest, getManagerInfo, updatePassword, createManagerByAdmin, validateSetPassword, setPassword };


// using manager job crud opwerations


export const createJobm = async (req, res) => {
    console.log(req.body);
    const { 
        jobtitle, 
        description, 
        location, 
        type, 
        employmentType, 
        openpositions, 
        salary, 
        skills, 
        experience, 
        keyResponsibilities, 
        preferredQualifications, 
        priority, 
        managerId, 
        recruiterId,
        company,
        hiringDeadline,
        internalNotes 
    } = req.body;
    console.log("managerId:", managerId);

    try {
        let job = await Job.findOne({ jobtitle });
        if (job) {
            return res.status(400).json({
                message: "You can't register the same job.",
                success: false
            });
        }

        job = await Job.create({
            jobtitle,
            description,
            location,
            type,
            employmentType,
            openpositions,
            salary,
            skills,
            experience,
            keyResponsibilities,
            preferredQualifications,
            priority,
            managerId,
            company,
            hiringDeadline: hiringDeadline ? new Date(hiringDeadline) : null,
            internalNotes: internalNotes || "",
            assignedTo: recruiterId ? [recruiterId] : []
        });
        if (recruiterId) {
            const recruiter = await Recruiter.findById(recruiterId);
            const manager = await User.findById(managerId);

            if (recruiter && manager) {
                await sendWelcomeEmail(recruiter.email, manager.name, jobtitle);
            }
        }

        return res.status(201).json({
            message: "Job registered successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error registering the job.",
            success: false
        });
    }
};



export const getAllJobsm = async (req, res) => {
    try {
        const managerId = req.params.managerId;
        console.log("managerId", managerId);
        if (!managerId) {
            return res.status(400).json({ message: 'Manager ID is required.' });
        }

        const jobs = await Job.find({ managerId })
            .populate('adminId', 'fullname username')
            .populate('managerId', 'fullname username')
            .populate('assignedRecruiters', 'fullname email status');
        console.log(jobs);
        return res.status(200).json({
            message: "Jobs fetched successfully.",
            jobs,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching jobs.",
            success: false
        });
    }
};

export const updateJobm = async (req, res) => {
    const { jobId } = req.params;
    const { priority, internalNotes, skills, assignedRecruiters } = req.body;

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        // Get the previous assigned recruiters to compare with new ones
        const previousAssignedRecruiters = job.assignedRecruiters || [];
        const newAssignedRecruiters = assignedRecruiters || [];

        if (priority !== undefined) job.priority = [priority];
        if (internalNotes !== undefined) job.internalNotes = internalNotes;
        if (skills !== undefined) job.skills = skills;
        if (assignedRecruiters !== undefined) job.assignedRecruiters = assignedRecruiters;

        await job.save();

        // Update assignedJobs field in recruiter models
        if (assignedRecruiters !== undefined) {
            // Find recruiters that were removed (in previous but not in new)
            const removedRecruiters = previousAssignedRecruiters.filter(
                recruiterId => !newAssignedRecruiters.includes(recruiterId)
            );

            // Find recruiters that were added (in new but not in previous)
            const addedRecruiters = newAssignedRecruiters.filter(
                recruiterId => !previousAssignedRecruiters.includes(recruiterId)
            );

            // Remove job from removed recruiters' assignedJobs
            if (removedRecruiters.length > 0) {
                await Recruiter.updateMany(
                    { _id: { $in: removedRecruiters } },
                    { $pull: { assignedJobs: jobId } }
                );
            }

            // Add job to added recruiters' assignedJobs
            if (addedRecruiters.length > 0) {
                await Recruiter.updateMany(
                    { _id: { $in: addedRecruiters } },
                    { $addToSet: { assignedJobs: jobId } }
                );
            }
        }

        // Populate assignedRecruiters for response
        await job.populate('assignedRecruiters', 'fullname email status');

        return res.status(200).json({
            message: "Job updated successfully",
            job,
            success: true
        });
    } catch (error) {
        console.error("updateJobm error:", error);
        return res.status(500).json({
            message: "Error updating job",
            success: false
        });
    }
};

export const assignedJobm = async (req, res) => {
    const { recruiterId, sendNotification } = req.body;  
    const { jobId } = req.params;

    try {
        if (!recruiterId || typeof recruiterId !== 'string') {
            return res.status(400).json({ message: "Invalid recruiterId", success: false });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        if (!Array.isArray(job.assignedTo)) job.assignedTo = [];

        const wasAlreadyAssigned = job.assignedTo.includes(recruiterId);
        if (!wasAlreadyAssigned) {
            job.assignedTo.push(recruiterId);
        }

        job.isAssigned = job.assignedTo.length > 0;

        await job.save();
        // Add job to recruiter's assignedJobs
        await Recruiter.findByIdAndUpdate(
            recruiterId,
            { $addToSet: { assignedJobs: jobId } }
        );
        const recruiter = await Recruiter.findById(recruiterId);
        const manager = await User.findById(job.managerId);

        // Only send notification if requested, and only to newly assigned recruiters
        if (sendNotification && recruiter && manager && !wasAlreadyAssigned) {
            await sendAttractiveJobAssignmentEmail(
                recruiter.email,
                manager.username || manager.fullname || 'Manager',
                job.jobtitle,
                job.location,
                job.description
            );
        }

        return res.status(200).json({
            message: "Recruiter assigned successfully",
            job,
            success: true
        });
    } catch (error) {
        console.error("assignedJobm error:", error);
        return res.status(500).json({
            message: "Error assigning recruiter",
            success: false
        });
    }
};


const sendWelcomeEmail = async (toEmail, managerName, jobname) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'You have been added as a Recruiter',
      html: `
        <p>Hello,</p>
        <p>You have been added as a recruiter by manager <strong>${managerName}</strong> to the job <strong>${jobname}</strong>.</p>
        <p>Please login to your account using your credentials.</p>
      `,
    };

    console.log("Sending welcome email with options:", mailOptions);

    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;  
  }
};

export const getManagerProfile = async (req, res) => {
  try {
    console.log("getManagerProfile hit ----");
    console.log('getManagerProfile - User from middleware:', req.user);
    console.log('getManagerProfile - User ID:', req.user._id);
    
    const manager = await User.findById(req.user._id)
      .populate('adminId', 'fullname username');
    
    console.log('getManagerProfile - Found manager:', !!manager);
    
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Determine who onboarded the manager
    let onboardedBy = 'N/A';
    if (manager.adminId) {
      onboardedBy = `Admin ${manager.adminId.fullname || manager.adminId.username}`;
    }

    console.log('getManagerProfile - Onboarded by:', onboardedBy);

    // Format the response
    const profileData = {
      _id: manager._id,
      email: manager.email,
      username: manager.username,
      fullname: manager.fullname || '',
      DOB: manager.DOB ? new Date(manager.DOB).toISOString().split('T')[0] : '',
      gender: manager.gender || '',
      phone: manager.phone || '',
      type: manager.type,
      address: manager.address || '',
      department: manager.department || '',
      onboardedBy: onboardedBy,
      createdAt: manager.createdAt,
      updatedAt: manager.updatedAt
    };

    console.log('getManagerProfile - Sending response:', profileData);

    res.json({ manager: profileData });
  } catch (error) {
    console.error('Error fetching manager profile:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateManagerProfile = async (req, res) => {
  try {
    const { fullname, DOB, gender, phone, address, department } = req.body;
    
    const updateData = {};
    if (fullname !== undefined) updateData.fullname = fullname;
    if (DOB !== undefined) updateData.DOB = DOB;
    if (gender !== undefined) updateData.gender = gender;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (department !== undefined) updateData.department = department;

    const manager = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    res.json({ 
      message: "Profile updated successfully", 
      manager 
    });
  } catch (err) {
    console.error('Error updating manager profile:', err);
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
};

const createManagerByAdmin = async (req, res) => {
  try {
    const { fullname, email, password, dateOfBirth, gender, phone, onboardedBy, adminId } = req.body;
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email is already registered" });
    }

    const username = fullname.replace(/\s+/g, '').toLowerCase();
    
    // Create user
    const user = await User.create({
      username,
      fullname,
      email,
      password,
      type: 'manager',
      adminId,
      DOB: dateOfBirth,
      gender,
      phone,
      firstPassSet: false
    });

    // Generate reset token for password setting
    const resetToken = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "7d" });
    
    // Save reset token to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save({ validateBeforeSave: false });

    // Create password set URL
    const setPasswordUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/manager/set_password/${user._id}/${resetToken}`;
    
    // Console log the URL for testing
    console.log('Password set URL:', setPasswordUrl);
    console.log('Sending password set email to:', email);

    // Send email with password set link
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Set Your Password - Manager Account Created',
      html: `
        <h2>Welcome ${fullname}!</h2>
        <p>Your manager account has been created successfully.</p>
        <p>Please click the link below to set your password:</p>
        <a href="${setPasswordUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Set Password</a>
        <p>This link will expire in 7 days.</p>
        <p>If you didn't request this account, please ignore this email.</p>
      `
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Email error:', error);
        // Don't fail the request if email fails, just log it
      } else {
        console.log('Password set email sent successfully');
      }
    });

    // Remove sensitive data from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json({
      status: 201,
      message: "Manager created successfully. Password set link has been sent to the email.",
      data: createdUser
    });

  } catch (error) {
    console.error('Error creating manager:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const validateSetPassword = async (req, res) => {
  const { id, token } = req.params;

  try {
    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if reset token matches and is not expired
    if (user.resetPasswordToken !== token) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // Verify JWT token
    jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      return res.json({
        firstPassSet: user.firstPassSet,
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          type: user.type
        }
      });
    });

  } catch (error) {
    console.error('Error validating set password:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const setPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check firstPassSet
    if (user.firstPassSet) {
      return res.status(400).json({ message: "You have already set the password" });
    }

    // Check if reset token matches and is not expired
    if (user.resetPasswordToken !== token) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // Verify JWT token
    jwt.verify(token, "jwt_secret_key", async (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      try {
        // Update password and set firstPassSet to true
        user.password = password;
        user.firstPassSet = true;
        user.status = 'active'; // Activate user when they set password
        
        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        return res.json({ message: "Password set successfully" });
      } catch (updateError) {
        console.error('Password update error:', updateError);
        return res.status(500).json({ message: "Failed to update password" });
      }
    });

  } catch (error) {
    console.error('Error setting password:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const searchRecruitersByManager = async (req, res) => {
    try {
        const { query = "", managerId } = req.query;
        if (!managerId) return res.status(400).json({ message: 'managerId required' });
        // Find recruiters for this manager, active only, matching name/email
        const regex = new RegExp(query, 'i');
        const recruiters = await Recruiter.find({
            $and: [
                { $or: [ { fullname: regex }, { email: regex } ] },
                { status: 'active' },
                { $or: [ { userId: managerId }, { managerId: managerId } ] }
            ]
        })
        .limit(10)
        .select('fullname email status');
        res.json({ recruiters });
    } catch (err) {
        res.status(500).json({ message: 'Error searching recruiters', error: err.message });
    }
};

// Get marketplace metrics for manager
export const getMarketplaceMetrics = async (req, res) => {
    try {
        const managerId = req.user._id; // From JWT middleware
        
        // Find the manager user to get mpJobs array
        const manager = await User.findById(managerId).populate('mpJobs');
        
        if (!manager) {
            return res.status(404).json({
                message: "Manager not found.",
                success: false
            });
        }

        const mpJobs = manager.mpJobs || [];
        
        // Calculate metrics
        const totalJobs = mpJobs.length;
        
        // Count active jobs (isClosed = false)
        const activeJobs = mpJobs.filter(job => !job.isClosed).length;
        
        // Sum of mpSelectedCandidates from all jobs
        const selectedCandidates = mpJobs.reduce((sum, job) => {
            return sum + (job.mpSelectedCandidates || 0);
        }, 0);
        
        // Sum of mpRejectedCandidates from all jobs
        const rejectedCandidates = mpJobs.reduce((sum, job) => {
            return sum + (job.mpRejectedCandidates || 0);
        }, 0);
        
        return res.status(200).json({
            message: "Marketplace metrics fetched successfully.",
            metrics: {
                totalJobs,
                activeJobs,
                selectedCandidates,
                rejectedCandidates
            },
            success: true
        });
    } catch (error) {
        console.error('Error fetching marketplace metrics:', error);
        return res.status(500).json({
            message: "Error fetching marketplace metrics.",
            success: false
        });
    }
};

// Create marketplace company
export const createMarketplaceCompany = async (req, res) => {
    try {
        const managerId = req.user._id; // From JWT middleware
        const {
            companyName,
            companyEmail,
            industryType,
            companySize,
            location,
            headquartersLocation,
            websiteUrl,
            companyDescription,
            hiringDomains,
            jobType,
            hiringLocations,
            packageRange
        } = req.body;

        // Validate required fields
        if (!companyName || !companyEmail || !industryType || !companySize || 
            !location || !headquartersLocation || !websiteUrl || !companyDescription ||
            !hiringDomains || !jobType || !hiringLocations || !packageRange) {
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            });
        }

        // Create new marketplace company
        const newMpCompany = new MpCompany({
            companyName,
            companyEmail,
            industry: industryType,
            companySize,
            location,
            headquartersLocation,
            websiteUrl,
            companyDescription,
            hiringDomains,
            preferredJobTypes: jobType,
            hiringLocations,
            packageRange,
            creatorId: managerId
        });

        // Save the company
        const savedCompany = await newMpCompany.save();

        // Add company to manager's mpCompanies array
        await User.findByIdAndUpdate(managerId, {
            $push: { mpCompanies: savedCompany._id }
        });

        return res.status(201).json({
            message: "Marketplace company created successfully.",
            company: savedCompany,
            success: true
        });
    } catch (error) {
        console.error('Error creating marketplace company:', error);
        return res.status(500).json({
            message: "Error creating marketplace company.",
            success: false
        });
    }
};

// Get marketplace companies for manager
export const getMarketplaceCompanies = async (req, res) => {
    try {
        const managerId = req.user._id; // From JWT middleware
        
        // Find the manager user to get mpCompanies array
        const manager = await User.findById(managerId).populate('mpCompanies');
        
        if (!manager) {
            return res.status(404).json({
                message: "Manager not found.",
                success: false
            });
        }

        const mpCompanies = manager.mpCompanies || [];
        
        // Transform the data to match the expected format for the frontend
        const companies = mpCompanies.map(company => ({
            _id: company._id,
            id: company._id,
            companyName: company.companyName,
            name: company.companyName,
            location: company.location,
            description: company.companyDescription,
            industry: company.industry,
            activeJobs: company.activeJobs || 0,
            hiresMade: company.totalHires || 0,
            status: company.isActive ? 'Active' : 'Inactive',
            isActive: company.isActive,
            websiteUrl: company.websiteUrl,
            companyEmail: company.companyEmail,
            companySize: company.companySize,
            headquartersLocation: company.headquartersLocation,
            hiringDomains: company.hiringDomains,
            preferredJobTypes: company.preferredJobTypes,
            hiringLocations: company.hiringLocations,
            packageRange: company.packageRange,
            // Candidate Statistics
            pickedNumber: company.pickedNumber || 0,
            candidatesCount: company.candidatesCount || 0,
            selectedCandidatesCount: company.selectedCandidatesCount || 0,
            rejectedCandidatesCount: company.rejectedCandidatesCount || 0,
            redFlagCount: company.redFlagCount || 0
        }));
        
        return res.status(200).json({
            message: "Marketplace companies fetched successfully.",
            companies,
            success: true
        });
    } catch (error) {
        console.error('Error fetching marketplace companies:', error);
        return res.status(500).json({
            message: "Error fetching marketplace companies.",
            success: false
        });
    }
};

// Get specific marketplace company by ID
export const getMarketplaceCompanyById = async (req, res) => {
    try {
        const managerId = req.user._id; // From JWT middleware
        const { companyId } = req.params;
        
        // Find the manager user to get mpCompanies array
        const manager = await User.findById(managerId).populate('mpCompanies');
        
        if (!manager) {
            return res.status(404).json({
                message: "Manager not found.",
                success: false
            });
        }

        // Find the specific company in manager's mpCompanies
        const company = manager.mpCompanies.find(comp => comp._id.toString() === companyId);
        
        if (!company) {
            return res.status(404).json({
                message: "Company not found or you don't have permission to view this company.",
                success: false
            });
        }
        
        // Transform the data to match the expected format for the frontend
        const companyData = {
            _id: company._id,
            id: company._id,
            companyName: company.companyName,
            name: company.companyName,
            location: company.location,
            description: company.companyDescription,
            industry: company.industry,
            activeJobs: company.activeJobs || 0,
            hiresMade: company.totalHires || 0,
            status: company.isActive ? 'Active' : 'Inactive',
            isActive: company.isActive,
            websiteUrl: company.websiteUrl,
            companyEmail: company.companyEmail,
            companySize: company.companySize,
            headquartersLocation: company.headquartersLocation,
            hiringDomains: company.hiringDomains,
            preferredJobTypes: company.preferredJobTypes,
            hiringLocations: company.hiringLocations,
            packageRange: company.packageRange,
            // Candidate Statistics
            pickedNumber: company.pickedNumber || 0,
            candidatesCount: company.candidatesCount || 0,
            selectedCandidatesCount: company.selectedCandidatesCount || 0,
            rejectedCandidatesCount: company.rejectedCandidatesCount || 0,
            redFlagCount: company.redFlagCount || 0
        };
        
        return res.status(200).json({
            message: "Marketplace company fetched successfully.",
            company: companyData,
            success: true
        });
    } catch (error) {
        console.error('Error fetching marketplace company:', error);
        return res.status(500).json({
            message: "Error fetching marketplace company.",
            success: false
        });
    }
};

// Get marketplace jobs for a specific company
export const getMarketplaceJobsByCompany = async (req, res) => {
    try {
        const managerId = req.user._id; // From JWT middleware
        const { companyId } = req.params;
        
        // Find the manager user to get mpCompanies array
        const manager = await User.findById(managerId).populate('mpCompanies');
        
        if (!manager) {
            return res.status(404).json({
                message: "Manager not found.",
                success: false
            });
        }

        // Find the specific company in manager's mpCompanies
        const company = manager.mpCompanies.find(comp => comp._id.toString() === companyId);
        
        if (!company) {
            return res.status(404).json({
                message: "Company not found or you don't have permission to view this company.",
                success: false
            });
        }

        // Fetch all jobs for this company
        const jobs = await MpJob.find({ mpCompanies: companyId })
            .sort({ createdAt: -1 }); // Sort by newest first
        
        // Transform the data to match the expected format for the frontend
        const transformedJobs = jobs.map(job => ({
            id: job._id,
            title: job.jobTitle,
            commission: '8% Commission', // Default commission
            status: job.isClosed ? 'Closed' : 'Active',
            companiesPicked: `${job.mpCompanies?.length || 0}+ Companies Picked`,
            timeLeft: job.hiringDeadline ? 
                `${Math.ceil((new Date(job.hiringDeadline) - new Date()) / (1000 * 60 * 60 * 24))}d left` : 
                'No deadline',
            company: company.companyName,
            location: job.location,
            type: job.jobType,
            experience: `${job.experience?.min || 0}-${job.experience?.max || 10} years`,
            salary: job.salary?.min && job.salary?.max ? 
                `₹${(job.salary.min / 1000).toFixed(0)}k-₹${(job.salary.max / 1000).toFixed(0)}k` : 
                'Not specified',
            postedDate: `Posted ${new Date(job.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            })}`,
            description: job.jobDescription,
            skills: job.skills || [],
            priority: job.priority || 'Medium',
            totalApplications: job.totalApplications || 0,
            totalInterviews: job.totalInterviews || 0,
            totalHires: job.totalHires || 0,
            mpSelectedCandidates: job.mpSelectedCandidates || 0,
            mpRejectedCandidates: job.mpRejectedCandidates || 0
        }));
        
        return res.status(200).json({
            message: "Marketplace jobs fetched successfully.",
            jobs: transformedJobs,
            success: true
        });
    } catch (error) {
        console.error('Error fetching marketplace jobs:', error);
        return res.status(500).json({
            message: "Error fetching marketplace jobs.",
            success: false
        });
    }
};

// Get job roles data for most picked job roles chart
export const getMarketplaceJobRoles = async (req, res) => {
    try {
        const managerId = req.user._id; // From JWT middleware
        const { companyName } = req.query; // Get company name from query params
        
        // Find the manager user to get mpCompanies array
        const manager = await User.findById(managerId).populate('mpCompanies');
        
        if (!manager) {
            return res.status(404).json({
                message: "Manager not found.",
                success: false
            });
        }

        const mpCompanies = manager.mpCompanies || [];
        
        // Get all jobs from all companies or specific company
        const allJobs = [];
        if (companyName && companyName !== 'All Companies') {
            // Filter for specific company
            const selectedCompany = mpCompanies.find(company => company.companyName === companyName);
            if (selectedCompany) {
                const companyJobs = await MpJob.find({ mpCompanies: selectedCompany._id });
                allJobs.push(...companyJobs);
            }
        } else {
            // Get all jobs from all companies
            for (const company of mpCompanies) {
                const companyJobs = await MpJob.find({ mpCompanies: company._id });
                allJobs.push(...companyJobs);
            }
        }
        
        // Count job titles
        const jobTitleCounts = {};
        allJobs.forEach(job => {
            const title = job.jobTitle;
            if (title) {
                jobTitleCounts[title] = (jobTitleCounts[title] || 0) + 1;
            }
        });
        
        // Convert to array and sort by count
        const jobRoles = Object.entries(jobTitleCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Get top 5
        
        // Calculate percentages
        const totalJobs = allJobs.length;
        const jobRolesWithPercentage = jobRoles.map((role, index) => {
            const percentage = totalJobs > 0 ? Math.round((role.count / totalJobs) * 100) : 0;
            const colors = ["#2563eb", "#1e3a8a", "#6b7280", "#ea580c", "#eab308"];
            return {
                name: role.name,
                count: role.count,
                percentage: percentage,
                color: colors[index] || "#6b7280"
            };
        });
        
        // Get company names for dropdown
        const companies = mpCompanies.map(company => company.companyName);
        
        return res.status(200).json({
            message: "Job roles data fetched successfully.",
            data: {
                jobRoles: jobRolesWithPercentage,
                companies: companies,
                totalJobs: totalJobs,
                selectedCompany: companyName || 'All Companies'
            },
            success: true
        });
    } catch (error) {
        console.error('Error fetching job roles data:', error);
        return res.status(500).json({
            message: "Error fetching job roles data.",
            success: false
        });
    }
};

// Create marketplace job
export const createMarketplaceJob = async (req, res) => {
    try {
        console.log('Creating marketplace job with data:', req.body);
        const managerId = req.user._id; // From JWT middleware
        const {
            jobTitle,
            company,
            location,
            employmentType,
            department,
            workMode,
            jobDescription,
            skills,
            experience,
            openings,
            packageRange,
            priority,
            hiringDeadline,
            tat,
            companyId,
            commissionRate
        } = req.body;

        // Validate required fields
        if (!jobTitle || !company || !location || !employmentType || !workMode || 
            !jobDescription || !skills || !experience || !openings || !packageRange || 
            !hiringDeadline || !companyId || !commissionRate) {
            return res.status(400).json({
                message: "All required fields must be provided.",
                success: false
            });
        }

        // Validate commission rate
        const commissionRateNum = parseFloat(commissionRate);
        if (isNaN(commissionRateNum) || commissionRateNum < 0 || commissionRateNum > 100) {
            return res.status(400).json({
                message: "Commission rate must be a number between 0 and 100.",
                success: false
            });
        }

        // Verify that the company belongs to the manager
        const manager = await User.findById(managerId).populate('mpCompanies');
        if (!manager) {
            return res.status(404).json({
                message: "Manager not found.",
                success: false
            });
        }

        const mpCompany = manager.mpCompanies.find(comp => comp._id.toString() === companyId);
        if (!mpCompany) {
            return res.status(404).json({
                message: "Company not found or you don't have permission to create jobs for this company.",
                success: false
            });
        }

        // Parse experience range
        let experienceRange = { min: 0, max: 10 };
        if (experience.includes('0 - 2')) {
            experienceRange = { min: 0, max: 2 };
        } else if (experience.includes('2 - 5')) {
            experienceRange = { min: 2, max: 5 };
        } else if (experience.includes('5 - 10')) {
            experienceRange = { min: 5, max: 10 };
        } else if (experience.includes('10+')) {
            experienceRange = { min: 10, max: 20 };
        }

        // Parse salary range
        let salaryRange = { min: 0, max: 0 };
        if (packageRange.includes('₹50k-₹100k')) {
            salaryRange = { min: 50000, max: 100000 };
        } else if (packageRange.includes('₹100k-₹160k')) {
            salaryRange = { min: 100000, max: 160000 };
        } else if (packageRange.includes('₹160k-₹250k')) {
            salaryRange = { min: 160000, max: 250000 };
        } else if (packageRange.includes('₹250k-₹400k')) {
            salaryRange = { min: 250000, max: 400000 };
        } else if (packageRange.includes('₹400k+')) {
            salaryRange = { min: 400000, max: 1000000 };
        }

        // Parse hiring deadline
        let parsedDeadline;
        try {
            parsedDeadline = new Date(hiringDeadline);
            if (isNaN(parsedDeadline.getTime())) {
                throw new Error('Invalid date format');
            }
        } catch (dateError) {
            console.error('Date parsing error:', dateError);
            return res.status(400).json({
                message: "Invalid hiring deadline format.",
                success: false
            });
        }

        // Create new marketplace job
        const newMpJob = new MpJob({
            jobTitle,
            jobDescription,
            location,
            jobType: workMode, // Use workMode as jobType (Hybrid, Remote, On-site, Flexible)
            experience: experienceRange,
            salary: salaryRange,
            skills: skills.split(',').map(skill => skill.trim()),
            creatorId: managerId,
            creatorModel: 'User',
            companyName: mpCompany?.companyName || company,
            mpCompanies: [companyId],
            hiringDeadline: parsedDeadline,
            priority: priority || 'Medium',
            commissionRate: commissionRateNum,
            internalNotes: `Department: ${department || 'N/A'}, Employment Type: ${employmentType}, Openings: ${openings}, TAT: ${tat || '15 Days'}`
        });

        // Save the job
        const savedJob = await newMpJob.save();

        // Add job to manager's mpJobs array
        const userUpdateResult = await User.findByIdAndUpdate(managerId, {
            $push: { mpJobs: savedJob._id }
        });
        console.log('User update result:', userUpdateResult ? 'Success' : 'Failed');

        // Add job to company's mpJobs array and increment active jobs count
        const companyUpdateResult = await MpCompany.findByIdAndUpdate(companyId, {
            $push: { mpJobs: savedJob._id },
            $inc: { activeJobs: 1 }
        });
        console.log('Company update result:', companyUpdateResult ? 'Success' : 'Failed');

        console.log('Job created successfully:', savedJob);
        return res.status(201).json({
            message: "Marketplace job created successfully.",
            job: savedJob,
            success: true
        });
    } catch (error) {
        console.error('Error creating marketplace job:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        return res.status(500).json({
            message: "Error creating marketplace job.",
            error: error.message,
            success: false
        });
    }
};

export { refreshAccessToken };

// Attractive job assignment email for recruiters
const sendAttractiveJobAssignmentEmail = async (toEmail, managerName, jobTitle, jobLocation, jobDescription) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'You have been assigned a new job!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e0e7ef;">
          <div style="background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%); color: #fff; padding: 24px 32px;">
            <h2 style="margin: 0; font-size: 2rem;">🚀 New Job Assignment</h2>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 1.1rem; color: #1e293b;">Hello,</p>
            <p style="font-size: 1.1rem; color: #1e293b;">You have been <b>assigned</b> a new job by <b>${managerName}</b>!</p>
            <div style="margin: 24px 0; padding: 18px; background: #e0e7ef; border-radius: 8px; color: #334155;">
              <b>Job Title:</b> ${jobTitle}<br/>
              <b>Location:</b> ${jobLocation || 'N/A'}<br/>
              <b>Description:</b> <span style="color: #475569;">${jobDescription ? jobDescription.substring(0, 300) + (jobDescription.length > 300 ? '...' : '') : 'N/A'}</span>
            </div>
            <p style="font-size: 1.1rem; color: #1e293b;">Please login to your account to view and start working on this job.</p>
            <div style="margin-top: 32px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #2563eb; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 1.1rem;">Go to Dashboard</a>
            </div>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending attractive job assignment email:", error);
    throw error;
  }
};

// Get marketplace job by ID
export const getMarketplaceJobById = async (req, res) => {
    try {
        const { jobId } = req.params;
        const managerId = req.user._id;

        // Find the job
        const job = await MpJob.findById(jobId)
            .populate('mpCompanies', 'companyName logo')
            .populate('licensePartners', 'fullName email location bio createdAt')
            .populate('candidateList', 'candidateName email phone');

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Check if the manager has access to this job (through mpCompanies)
        const manager = await User.findById(managerId).populate('mpCompanies');
        const hasAccess = manager.mpCompanies.some(company => 
            job.mpCompanies.some(jobCompany => jobCompany._id.toString() === company._id.toString())
        );

        if (!hasAccess) {
            return res.status(403).json({
                message: "Access denied. You don't have permission to view this job.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job retrieved successfully.",
            success: true,
            job: job
        });

    } catch (error) {
        console.error("Error getting marketplace job:", error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

// Get marketplace user by ID
export const getMarketplaceUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const managerId = req.user._id;

        // Find the user
        const user = await MpUser.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        // Check if the manager has access to this user (through their companies' jobs)
        const manager = await User.findById(managerId).populate('mpCompanies');
        const managerCompanyIds = manager.mpCompanies.map(company => company._id);

        // Check if this user has picked any jobs from manager's companies
        const userJobs = await MpJob.find({ 
            licensePartners: userId,
            mpCompanies: { $in: managerCompanyIds }
        });

        if (userJobs.length === 0) {
            return res.status(403).json({
                message: "Access denied. This user is not a license partner for any of your company's jobs.",
                success: false
            });
        }

        return res.status(200).json({
            message: "User retrieved successfully.",
            success: true,
            user: user
        });

    } catch (error) {
        console.error("Error getting marketplace user:", error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

// Get candidates for a marketplace job (for managers)
export const getManagerMarketplaceCandidates = async (req, res) => {
    try {
        const { jobId } = req.params;
        const managerId = req.user._id;

        console.log('Getting marketplace candidates for job:', jobId, 'manager:', managerId);

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required.",
                success: false
            });
        }

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: "Invalid job ID.",
                success: false
            });
        }

        // First verify that the manager has access to this job
        const job = await MpJob.findById(jobId).populate('mpCompanies');
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Check if the manager has access to this job (through mpCompanies)
        const manager = await User.findById(managerId).populate('mpCompanies');
        const hasAccess = manager.mpCompanies.some(company => 
            job.mpCompanies.some(jobCompany => jobCompany._id.toString() === company._id.toString())
        );

        if (!hasAccess) {
            return res.status(403).json({
                message: "Access denied. You don't have permission to view candidates for this job.",
                success: false
            });
        }

        // Find all resumes for this job (marketplace candidates)
        const candidates = await Resume.find({
            jobId: jobId,
            isMPUser: true
        }).select('name email title experience location ats_score overallScore status createdAt interviewScheduled interviewEvaluation');

        console.log(`Found ${candidates.length} candidates for job ${jobId}`);

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

        return res.status(200).json({
            message: "Candidates retrieved successfully.",
            success: true,
            data: {
                candidates: transformedCandidates,
                total: transformedCandidates.length
            }
        });

    } catch (error) {
        console.error("Error getting marketplace candidates:", error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

// Get marketplace resume details (for managers)
export const getManagerMarketplaceResume = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const managerId = req.user._id;

        console.log('Getting marketplace resume details for resume:', resumeId, 'manager:', managerId);

        if (!resumeId) {
            return res.status(400).json({
                message: "Resume ID is required.",
                success: false
            });
        }

        if (!mongoose.Types.ObjectId.isValid(resumeId)) {
            return res.status(400).json({
                message: "Invalid resume ID.",
                success: false
            });
        }

        // Find the resume
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({
                message: "Resume not found.",
                success: false
            });
        }

        // Check if the manager has access to this resume through the job
        if (resume.jobId) {
            const job = await MpJob.findById(resume.jobId).populate('mpCompanies');
            if (job) {
                const manager = await User.findById(managerId).populate('mpCompanies');
                const hasAccess = manager.mpCompanies.some(company => 
                    job.mpCompanies.some(jobCompany => jobCompany._id.toString() === company._id.toString())
                );

                if (!hasAccess) {
                    return res.status(403).json({
                        message: "Access denied. You don't have permission to view this resume.",
                        success: false
                    });
                }
            }
        }

        return res.status(200).json({
            message: "Resume details retrieved successfully.",
            success: true,
            data: resume
        });

    } catch (error) {
        console.error("Error getting marketplace resume details:", error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

// Get all marketplace jobs (for statistics)
export const getAllMarketplaceJobs = async (req, res) => {
    try {
        const managerId = req.user._id;

        console.log('Getting all marketplace jobs for manager:', managerId);

        // Find the manager user to get mpCompanies array
        const manager = await User.findById(managerId).populate('mpCompanies');
        
        if (!manager) {
            return res.status(404).json({
                message: "Manager not found.",
                success: false
            });
        }

        const mpCompanies = manager.mpCompanies || [];
        const companyIds = mpCompanies.map(company => company._id);

        // Find all jobs from manager's companies
        const jobs = await MpJob.find({ 
            mpCompanies: { $in: companyIds }
        })
        .populate('mpCompanies', 'companyName logo')
        .select('-internalNotes')
        .sort({ createdAt: -1 });

        console.log(`Found ${jobs.length} marketplace jobs for manager`);

        // Transform jobs data for statistics
        const transformedJobs = jobs.map(job => {
            console.log(`Job ${job.jobTitle} pickHistory:`, job.pickHistory);
            console.log(`Job ${job.jobTitle} pickedNumber:`, job.pickedNumber);
            return {
                _id: job._id,
                jobTitle: job.jobTitle,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt,
                pickHistory: job.pickHistory || [],
                pickedNumber: job.pickedNumber || 0,
                mpCompanies: job.mpCompanies,
                status: job.status,
                isClosed: job.isClosed
            };
        });

        return res.status(200).json({
            message: "Marketplace jobs retrieved successfully.",
            success: true,
            jobs: transformedJobs
        });

    } catch (error) {
        console.error('Error fetching marketplace jobs:', error);
        return res.status(500).json({
            message: "Error fetching marketplace jobs.",
            success: false
        });
    }
};
