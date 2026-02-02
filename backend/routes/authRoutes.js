const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

const imageUpload = require("../middleware/imageUpload");

console.log(authController);
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/profile", require("../middleware/authMiddleware").protect, authController.getProfile);
router.put("/profile", require("../middleware/authMiddleware").protect, imageUpload.single("profilePicture"), authController.updateProfile);
router.put("/change-password", require("../middleware/authMiddleware").protect, authController.changePassword);

module.exports = router;
