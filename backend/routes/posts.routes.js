import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import {
  activeCheck,
  createPost,
  deletePost,
  getAllPosts,
  commentOnPost,
  get_comments_by_post,
  delete_comment_of_user,
  edit_comment,
  reply_to_comment,
  get_replies_by_comment,
  toggleLike,
} from "../controllers/posts.controller.js";

const router = Router();

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      crypto.randomBytes(8).toString("hex") + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.route("/").get(activeCheck);

router.route("/post").post(upload.single("media"), createPost);
router.route("/posts").get(getAllPosts);
router.route("/delete_post").delete(deletePost);
router.route("/toggle_like").patch(toggleLike);
router.route("/comment").post(commentOnPost);
router.route("/get_comments").get(get_comments_by_post);
router.route("/delete_comment").delete(delete_comment_of_user);
router.route("/edit_comment").put(edit_comment);
router.route("/reply_comment").post(reply_to_comment);
router.route("/get_replies").get(get_replies_by_comment);

export default router;
