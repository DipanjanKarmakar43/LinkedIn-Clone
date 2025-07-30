import Profile from "../models/profile.model.js";
import Post from "../models/posts.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comments.model.js";

export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "Server is active" });
};

export const createPost = async (req, res) => {
  const { token, body } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ message: "Unauthorized" });

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

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ active: true })
      .populate("userId", "name username email profilePicture")
      .sort({ createdAt: -1 });
    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }
    return res.json({
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Get all posts error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  const { postId, token } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await Post.deleteOne({ _id: postId });
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const toggleLike = async (req, res) => {
  const { postId, token } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userIdStr = user._id.toString();
    const isLiked = post.likes.get(userIdStr);

    if (isLiked) {
      post.likes.delete(userIdStr);
    } else {
      post.likes.set(userIdStr, true);
    }
    const updatedPost = await post.save();
    return res.status(200).json({
      message: "Like status updated",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const get_comments_by_post = async (req, res) => {
  const { postId } = req.query;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comments = await Comment.find({ postId }).populate(
      "userId",
      "name username profilePicture"
    );
    return res.status(200).json({
      message: "Comments fetched successfully",
      comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const create_comment = async (req, res) => {
  const { postId, text, userId } = req.body;
  if (!text || !postId || !userId) {
    return res
      .status(400)
      .json({ message: "Comment text, postId, and userId are required." });
  }
  try {
    const newComment = new Comment({
      postId,
      userId,
      body: text,
    });
    await newComment.save();
    const populatedComment = await Comment.findById(newComment._id).populate(
      "userId",
      "name username profilePicture"
    );
    return res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const delete_comment_of_user = async (req, res) => {
  const { commentId, token } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const comment = await Comment.findOne({ _id: commentId });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await Comment.deleteOne({ _id: commentId });
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const edit_comment = async (req, res) => {
  const { commentId, updatedBody, token } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    comment.body = updatedBody;
    await comment.save();

    await comment.populate("userId", "name profilePicture");

    return res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Error editing comment:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const reply_to_comment = async (req, res) => {
  const { commentId, replyBody, token } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }
    const reply = new Comment({
      postId: parentComment.postId,
      userId: user._id,
      body: replyBody,
      parentCommentId: parentComment._id,
    });
    await reply.save();

    await reply.populate("userId", "name profilePicture");

    return res.status(201).json({
      message: "Reply added successfully",
      reply,
    });
  } catch (error) {
    console.error("Error replying to comment:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const get_replies_by_comment = async (req, res) => {
  const { commentId } = req.query;
  try {
    const replies = await Comment.find({ parentCommentId: commentId })
      .populate("userId", "name username profilePicture")
      .sort({ _id: -1 });
    return res.status(200).json({
      message: "Replies fetched successfully",
      replies,
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];

    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const posts = await Post.find({ userId: user._id })
      .populate("userId", "name username email profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Get User Posts Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
