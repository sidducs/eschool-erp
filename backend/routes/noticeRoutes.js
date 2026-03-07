const express = require("express");
const router = express.Router();
const { createNotice, getNotices, deleteNotice, getPublicNotices } = require("../controllers/noticeController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotices);
router.get("/public", getPublicNotices); // NEW: Unprotected endpoint for pre-login Emergency Banner
router.post("/", protect, createNotice);
router.delete("/:id", protect, deleteNotice);

module.exports = router;