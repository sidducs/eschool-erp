const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/fileUpload");
const { uploadFile } = require("../controllers/commonController");

router.post("/upload", protect, upload.single("file"), uploadFile);

module.exports = router;
