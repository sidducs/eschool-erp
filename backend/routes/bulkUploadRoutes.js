const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const { bulkUploadStudents } = require("../controllers/bulkUploadController");

router.post(
  "/students",
  protect,
  isAdmin,
  upload.single("file"), // 👈 MUST be "file"
  bulkUploadStudents
);

module.exports = router;
