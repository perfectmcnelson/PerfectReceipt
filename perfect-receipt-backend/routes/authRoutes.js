const express = require("express")
// const { uploadProfilePicture: uploadProfileImg, uploadBusinessLogo: uploadBizLogo } = require('../utils/uploadConfig');
const {registerUser, loginUser, getMe, updateUserProfile, enable2FA, verify2FA, disable2FA, verify2FALogin, forgotPassword, resetPassword, googleAuth, exportUserData, sendVerificationEmail, resendVerificationEmail, verifyEmailByCode, verifyEmailByToken } = require("../controllers/authController")
const {protect} = require("../middlewares/authMiddleware")
// const upload = require('../utils/uploadConfig');

const {
  uploadProfileImg,
  uploadBizLogo,
} = require("../utils/uploadConfig");

const {
  uploadProfilePicture,
  uploadBusinessLogo,
} = require("../controllers/authController");

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateUserProfile);

// Google OAuth
router.post("/google", googleAuth);

// Email Verification
router.post("/send-verification-email", sendVerificationEmail);
router.post('/resend-verification-email', resendVerificationEmail)
router.get("/verify-email/:token", verifyEmailByToken);
router.post("/verify-email/code", verifyEmailByCode);


router.post(
  "/upload-profile-picture",
  protect,
  uploadProfileImg.single("profilePicture"),
  uploadProfilePicture
);

router.post(
  "/upload-business-logo",
  protect,
  uploadBizLogo.single("businessLogo"),
  uploadBusinessLogo
);



// 2FA routes
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/verify", protect, verify2FA);
router.post("/2fa/disable", protect, disable2FA);
router.post("/2fa/verify-login", verify2FALogin);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Data export
router.get("/export-data", protect, exportUserData);


module.exports = router;