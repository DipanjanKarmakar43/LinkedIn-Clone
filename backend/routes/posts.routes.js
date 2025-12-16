// backend/routes/posts.routes.js
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

const router = Router();

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images, videos, and documents
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype.includes('document')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
    }
  }
});

router.route("/").get(activeCheck);
router.route("/post").post(upload.single("media"), createPost);
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