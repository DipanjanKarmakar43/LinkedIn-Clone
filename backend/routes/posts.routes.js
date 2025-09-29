import { Router } from "express";
import multer from "multer";
import {
  activeCheck,
  createPost,
  deletePost,
  getAllPosts,
  create_comment,
  get_comments_by_post,
  delete_comment_of_user,
  edit_comment,
  reply_to_comment,
  get_replies_by_comment,
  toggleLike,
  getUserPosts,
} from "../controllers/posts.controller.js";
import cloudinary from "cloudinary";

// ---------------- Cloudinary Config ----------------
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------- Multer Setup ----------------
// Instead of saving locally, store in memory buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------- Router ----------------
const router = Router();

router.route("/").get(activeCheck);

// 👇 Upload middleware + Cloudinary
router.route("/post").post(upload.single("media"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert buffer to base64 Data URI for Cloudinary
    const fileBase64 = req.file.buffer.toString("base64");
    const fileURI = `data:${req.file.mimetype};base64,${fileBase64}`;

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(fileURI, {
      folder: "linkedin-clone", // 👈 customize folder name
      resource_type: "auto", // auto-detect image/video
    });

    // Attach Cloudinary URL to req.body before calling controller
    req.body.mediaUrl = result.secure_url;
    req.body.mediaPublicId = result.public_id;

    // Now call your controller
    return createPost(req, res, next);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ error: "Failed to upload to Cloudinary" });
  }
});

router.route("/posts").get(getAllPosts);
router.route("/posts/delete/:postId").delete(deletePost);
router.route("/toggle_like").patch(toggleLike);
router.route("/create_comment").post(create_comment);
router.route("/get_comments").get(get_comments_by_post);
router.route("/delete_comment").delete(delete_comment_of_user);
router.route("/edit_comment").put(edit_comment);
router.route("/reply_comment").post(reply_to_comment);
router.route("/get_replies").get(get_replies_by_comment);
router.route("/api/posts/my_posts").get(getUserPosts);

export default router;
