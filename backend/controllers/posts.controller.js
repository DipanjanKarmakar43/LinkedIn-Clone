import Profile from "../models/profile.model.js";
import Post from "../models/posts.model.js"; // <- Make sure this import exists
import User from "../models/user.model.js";

export const activeCheck = async (req, res) => {
  return res.status(200).json({
    message: "Server is active",
  });
};

export const createPost = async (req, res) => {
  const { token, body } = req.body;

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = new Post({
      userId: user._id,
      body,
      media: req.file ? req.file.filename : "",
      fileType: req.file ? req.file.mimetype : "",
    });

    await post.save();

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
