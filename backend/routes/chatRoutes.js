const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { askAI, getContacts, sendMessage, getMessages } = require("../controllers/chatController");

const router = express.Router();

router.post("/ask", protect, askAI);
router.get("/contacts/list", protect, getContacts);
router.post("/send", protect, sendMessage);
router.get("/:userId", protect, getMessages);

module.exports = router;
