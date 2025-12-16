// backend/routes/user.routes.js
import { Router } from "express";
import multer from "multer";
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
  getPendingConnectionRequests,
  findUserAndProfile,
  getSentConnectionRequests,
  getProfileByUserId,
} from "../controllers/user.controller.js";

const router = Router();

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    // Accept only images for profile pictures
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed for profile pictures.'));
    }
  }
});

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
router.post("/connections/pending-requests", getPendingConnectionRequests);
router.post("/connections/sent-requests", getSentConnectionRequests);
router.post("/connections", whatAreMyConnections);
router.post("/connections/accept", acceptConnectionRequest);
router.get("/users/search", findUserAndProfile);
router.get("/profile/:userId", getProfileByUserId);

export default router;