import { Router } from "express";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";
import {
  login,
  register,
  uploadProfilePicture,
  updateUserProfile,
  getUserAndProfile,
  updateProfileData,
  getAllUserProfiles,
  downloadProfile,
  sendConnectionRequest,
  acceptConnectionRequest,
  whatAreMyConnections,
  getMyConnectionsRequest,
} from "../controllers/user.controller.js";

const router = Router();

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName =
      crypto.randomBytes(8).toString("hex") + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post(
  "/update_profile_picture",
  upload.single("profile_picture"),
  uploadProfilePicture
);
router.post("/register", register);
router.post("/login", login);
router.post("/user_update", updateUserProfile);
router.get("/get_user_and_profile", getUserAndProfile);
router.post("/update_profile_data", updateProfileData);
router.get("/user/get_all_users", getAllUserProfiles);
router.get("/user/download_resume", downloadProfile);
router.post("/connections/request", sendConnectionRequest);
router.get("/connections/requests", getMyConnectionsRequest);
router.get("/connections", whatAreMyConnections);
router.post("/connections/accept", acceptConnectionRequest);

export default router;
