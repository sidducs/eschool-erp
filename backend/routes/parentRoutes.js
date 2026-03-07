const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getChildren } = require("../controllers/parentController");

const router = express.Router();

router.get("/children", protect, authorize("parent"), getChildren);

module.exports = router;
