import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";

import crypto from "crypto";
import bcrypt from "bcrypt";
import PDFDocument from "pdfkit";
import fs from "fs";

const convertUserDataToPDF = async (userData) => {
  try {
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);

    doc.pipe(stream);

    // Add profile picture if exists
    if (userData.userId.profilePicture) {
      doc.image(`uploads/${userData.userId.profilePicture}`, {
        align: "center",
        width: 100,
      });
    }

    // Add user information
    doc.fontSize(14).text(`Name: ${userData.userId.name || "Not provided"}`);
    doc
      .fontSize(14)
      .text(`Username: ${userData.userId.username || "Not provided"}`);
    doc.fontSize(14).text(`Email: ${userData.userId.email || "Not provided"}`);
    doc.fontSize(14).text(`Bio: ${userData.bio || "Not provided"}`);
    doc
      .fontSize(14)
      .text(`Current Position: ${userData.currentPosition || "Not provided"}`);

    // Add work experience if exists
    if (userData.pastWork && userData.pastWork.length > 0) {
      doc.fontSize(14).text("Work Experience:");
      userData.pastWork.forEach((work) => {
        doc
          .fontSize(12)
          .text(`- Company: ${work.companyName || "Not provided"}`);
        doc.fontSize(12).text(`  Position: ${work.position || "Not provided"}`);
        doc.fontSize(12).text(`  Years: ${work.years || "Not provided"}`);
      });
    }

    doc.end();
    return outputPath;
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error("Failed to generate PDF");
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // Basic validation
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const message =
        existingUser.email === email
          ? "Email already registered"
          : "Username already taken";
      return res.status(400).json({ message });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
    });

    // Create profile
    await Profile.create({ userId: newUser._id });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        message: "Email/username and password are required",
      });
    }

    // Find user with password field
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate simple token
    const token = crypto.randomBytes(32).toString("hex");
    user.token = token;
    await user.save();

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const token = req.headers.authorization?.split(" ")[1] || req.body.token;
    if (!token) {
      return res.status(401).json({ message: "Authorization required" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = req.file.filename;
    await user.save();

    return res.json({
      message: "Profile picture uploaded successfully",
      profilePicture: req.file.filename,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error uploading profile picture",
      error: error.message,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, password, ...updateData } = req.body;

    // Basic validation
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    // Find user by token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check for email/username conflicts
    if (updateData.email || updateData.username) {
      const conflictConditions = [];

      if (updateData.email) {
        conflictConditions.push({ email: updateData.email });
      }
      if (updateData.username) {
        conflictConditions.push({ username: updateData.username });
      }

      const existingUser = await User.findOne({
        $or: conflictConditions,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        const conflictField =
          existingUser.email === updateData.email ? "email" : "username";
        return res.status(409).json({
          message: `${conflictField} already in use by another account`,
        });
      }
    }

    // Prevent password updates through this endpoint
    if (password) {
      return res.status(400).json({
        message: "Use the change password endpoint to update password",
      });
    }

    // Update user data
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });

    await user.save();

    // Return updated user data (excluding sensitive fields)
    const { password: _, token: __, ...safeUserData } = user.toObject();
    return res.json({
      message: "Profile updated successfully",
      user: safeUserData,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(userProfile);
  } catch (error) {
    console.error("Get user and profile error:", error);
    return res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    // Find user by token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find and update profile
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Update profile data
    Object.keys(newProfileData).forEach((key) => {
      if (newProfileData[key] !== undefined) {
        profile[key] = newProfileData[key];
      }
    });

    await profile.save();

    return res.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update profile data error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllUserProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name email username profilePicture"
    );

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ message: "No profiles found" });
    }

    return res.json(profiles);
  } catch (error) {
    console.error("Get all user profiles error:", error);
    return res.status(500).json({
      message: "Error fetching profiles",
      error: error.message,
    });
  }
};

export const downloadResume = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userProfile = await Profile.findOne({ userId }).populate(
      "userId",
      "name email username profilePicture"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const outputPath = await convertUserDataToPDF(userProfile);

    return res.json({
      message: "Resume generated successfully",
      path: outputPath,
    });
  } catch (error) {
    console.error("Download resume error:", error);
    return res.status(500).json({
      message: "Error generating resume",
      error: error.message,
    });
  }
};
