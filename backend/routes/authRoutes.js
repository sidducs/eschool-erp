const express = require("express");
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimiter"); // 🔐 TC-SEC-04

const router = express.Router();

const fileUpload = require("../middleware/fileUpload");


router.post("/register", loginLimiter, authController.registerUser);
router.post("/login", loginLimiter, authController.loginUser);
router.get("/profile", require("../middleware/authMiddleware").protect, authController.getProfile);
router.put("/profile", require("../middleware/authMiddleware").protect, fileUpload.single("profilePicture"), authController.updateProfile);
const { forgotPassword, resetPassword } = require("../controllers/forgotPasswordController");
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.put("/change-password", require("../middleware/authMiddleware").protect, authController.changePassword);

module.exports = router;
