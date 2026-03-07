const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { createDoubt, getDoubts, answerDoubt, deleteDoubt } = require("../controllers/doubtController");

const router = express.Router();

router.route("/")
    .post(protect, createDoubt)
    .get(protect, getDoubts);

router.route("/:id/answer")
    .post(protect, authorize("teacher", "admin", "student"), answerDoubt);

router.route("/:id")
    .delete(protect, deleteDoubt);

module.exports = router;
