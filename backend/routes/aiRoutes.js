const express = require("express");
const router = express.Router();
const { generateRemark } = require("../controllers/aiController");

// Define the POST route
router.post("/generate-remark", generateRemark);

module.exports = router;