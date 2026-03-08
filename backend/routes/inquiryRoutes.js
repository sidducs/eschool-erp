const express = require("express");
const router = express.Router();
const { sendInquiry } = require("../controllers/inquiryController");

router.post("/send", sendInquiry);

module.exports = router;
