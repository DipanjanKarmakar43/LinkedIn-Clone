import mongoose from "mongoose";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import Connection from "../models/connections.model.js";
import Post from "../models/posts.model.js";
import crypto from "crypto";
import bcrypt from 'bcryptjs';
import PDFDocument from "pdfkit";
import fs from "fs";

const convertUserDataToPDF = async (userData) => {
  try {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);

    doc.pipe(stream);

    // --- HELPER FUNCTIONS ---
    const drawLine = (y) =>
      doc
        .strokeColor("#cccccc")
        .lineWidth(0.5)
        .moveTo(40, y)
        .lineTo(555, y)
        .stroke();
    const registerFonts = () => {
      // For simplicity, we'll stick to Helvetica, which is built-in.
      // If you had custom fonts: doc.registerFont('Bold', 'path/to/font-bold.ttf');
    };
    registerFonts();

    // --- HEADER ---
    const headerY = doc.y;
    if (
      userData.userId.profilePicture &&
      userData.userId.profilePicture !== "default.jpg"
    ) {
      const imagePath = `uploads/${userData.userId.profilePicture}`;
      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, 450, headerY, { width: 100 });
      }
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .text(userData.userId.name || "Unnamed User", 40, headerY + 10);
    doc
      .font("Helvetica")
      .fontSize(14)
      .text(userData.currentPost || "No position specified", {
        continued: false,
      });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#0066CC")
      .text(userData.userId.email, {
        link: `mailto:${userData.userId.email}`,
        underline: false,
      });
    doc.y = Math.max(doc.y, headerY + 110); // Ensure cursor is below the image
    drawLine(doc.y);
    doc.moveDown(2);

    // --- CAREER OVERVIEW / ABOUT ---
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#333333").text("ABOUT");
    doc.moveDown(0.3);
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(userData.bio || "No bio provided.", {
        align: "justify",
        lineGap: 4,
      });
    doc.moveDown(2);

    // --- EXPERIENCE & EDUCATION (SIDE-BY-SIDE LAYOUT) ---
    const sectionY = doc.y;
    const leftColumnX = 40;
    const rightColumnX = 320;

    // --- EDUCATION (Left Column) ---
    if (userData.education && userData.education.length > 0) {
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("EDUCATION", leftColumnX, sectionY);
      doc.moveDown(0.3);

      let currentY = doc.y;
      userData.education.forEach((edu) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(edu.degree, leftColumnX, currentY);
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(`${edu.school} | ${edu.fieldOfStudy}`);
        currentY = doc.y + 15; // Add spacing for next item
        doc.y = currentY;
      });
    }

    // --- EXPERIENCE (Right Column) ---
    if (userData.pastWork && userData.pastWork.length > 0) {
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("EXPERIENCE", rightColumnX, sectionY);
      doc.moveDown(0.3);

      let currentY = doc.y; // Align with the top of the education section text
      doc.y = sectionY + doc.currentLineHeight() + 3;

      userData.pastWork.forEach((work) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(work.position, rightColumnX, doc.y);
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(`${work.company} | ${work.years}`);
        // Add bullet points for description if you add it to your model later
        // doc.list(['Responsibility 1', 'Responsibility 2'], { bulletRadius: 1.5, textIndent: 10 });
        doc.moveDown(1.5);
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

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

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

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
      profilePicture: "default.jpg",
    });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    newUser.token = token;
    await newUser.save();

    // Create user profile
    await Profile.create({ userId: newUser._id });

    // Return token + user
    return res.status(201).json({
      message: "Registration successful",
      token,
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

    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

    if (password) {
      return res.status(400).json({
        message: "Use the change password endpoint to update password",
      });
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });
    await user.save();

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
    const { token } = req.query;
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
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
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

export const downloadProfile = async (req, res) => {
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

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found" });
    }
    if (user._id.equals(connectionUser._id)) {
      return res
        .status(400)
        .json({ message: "You cannot connect with yourself." });
    }
    const existingRequest = await Connection.findOne({
      $or: [
        { userId: user._id, connectionId: connectionUser._id },
        { userId: connectionUser._id, connectionId: user._id },
      ],
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A connection or request already exists." });
    }
    const request = new Connection({
      userId: user._id,
      connectionId: connectionUser._id,
      status: "pending",
    });
    await request.save();

    const populatedRequest = await Connection.findById(request._id).populate(
      "connectionId",
      "name email username profilePicture"
    );

    return res.status(201).json({
      message: "Connection request sent successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error("Send connection request error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getPendingConnectionRequests = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const requests = await Connection.find({
      connectionId: user._id,
      status: "pending",
    }).populate("userId", "name email username profilePicture");
    return res.json({
      message: "Pending connection requests fetched successfully",
      requests,
    });
  } catch (error) {
    console.error("Get pending connections request error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 👇👇 NEW FUNCTION ADDED HERE 👇👇
export const getSentConnectionRequests = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Find requests where the current user is the sender (userId)
    const requests = await Connection.find({
      userId: user._id,
      status: "pending",
    }).populate("connectionId", "name email username profilePicture");
    return res.json({
      message: "Sent connection requests fetched successfully",
      requests,
    });
  } catch (error) {
    console.error("Get sent connections request error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const whatAreMyConnections = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connections = await Connection.find({
      $or: [{ userId: user._id }, { connectionId: user._id }],
      status: "accepted",
    })
      .populate("userId", "name email username profilePicture")
      .populate("connectionId", "name email username profilePicture");
    return res.json({
      message: "Connections fetched successfully",
      connections,
    });
  } catch (error) {
    console.error("What are my connections error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connection = await Connection.findOne({
      _id: requestId,
      connectionId: user._id,
    });
    if (!connection) {
      return res.status(404).json({
        message:
          "Connection request not found or you are not authorized to accept it.",
      });
    }
    connection.status = "accepted";
    await connection.save();
    req.io.emit("connection_accepted", {
      requestId: connection._id,
      user: user,
    });

    return res.json({
      message: "Connection request accepted successfully",
      connection,
    });
  } catch (error) {
    console.error("Accept connection request error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const findUserAndProfile = async (req, res) => {
  const { q } = req.query;
  try {
    if (!q) {
      return res.status(400).json({ message: "A search term is required" });
    }
    const searchRegex = new RegExp(q, "i");
    const users = await User.find({
      name: { $regex: searchRegex },
    }).select("-password -token");
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    const userIds = users.map((user) => user._id);
    const profiles = await Profile.find({ userId: { $in: userIds } }).populate(
      "userId",
      "name email username profilePicture"
    );
    return res.json(profiles);
  } catch (error) {
    console.error("Find user and profile error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const userProfile = await Profile.findOne({ userId }).populate(
      "userId",
      "name email username profilePicture"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // You can also fetch the user's posts here if you want to display them
    const posts = await Post.find({ userId })
      .populate("userId", "name profilePicture")
      .sort({ createdAt: -1 });

    return res.json({ profile: userProfile, posts });
  } catch (error) {
    console.error("Get profile by ID error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
