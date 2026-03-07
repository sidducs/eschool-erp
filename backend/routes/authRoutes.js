const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

const fileUpload = require("../middleware/fileUpload");


router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/profile", require("../middleware/authMiddleware").protect, authController.getProfile);
router.put("/profile", require("../middleware/authMiddleware").protect, fileUpload.single("profilePicture"), authController.updateProfile);
router.put("/change-password", require("../middleware/authMiddleware").protect, authController.changePassword);

module.exports = router;
