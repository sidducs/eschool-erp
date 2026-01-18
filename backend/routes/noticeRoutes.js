const express = require("express");
const router = express.Router();
const { createNotice, getNotices, deleteNotice } = require("../controllers/noticeController");

// --- FIX IS HERE: Use { protect } to extract the function ---
const { protect } = require("../middleware/authMiddleware"); 

router.get("/", protect, getNotices);
router.post("/", protect, createNotice);
router.delete("/:id", protect, deleteNotice);

module.exports = router;