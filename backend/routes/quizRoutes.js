const express = require("express");
const router = express.Router();
const {
    createQuiz,
    getQuizzesByClass,
    deleteQuiz,
    submitQuiz,
    getMyResults,
} = require("../controllers/quizController");
const { protect, teacher } = require("../middleware/authMiddleware");

router.post("/create", protect, teacher, createQuiz);
router.delete("/:id", protect, teacher, deleteQuiz);
router.get("/class/:classId", protect, getQuizzesByClass);
router.post("/submit", protect, submitQuiz);
router.get("/results/my-results", protect, getMyResults);
router.delete("/result/:id", protect, require("../controllers/quizController").deleteQuizResult);

module.exports = router;
