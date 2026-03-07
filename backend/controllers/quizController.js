const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");


const createQuiz = async (req, res) => {
    try {
        const { title, classId, questions } = req.body;

        const quiz = new Quiz({
            title,
            classId,
            teacherId: req.user._id,
            questions,
        });

        const createdQuiz = await quiz.save();
        res.status(201).json(createdQuiz);
    } catch (error) {
        res.status(500).json({ message: "Failed to create quiz", error: error.message });
    }
};

const getQuizzesByClass = async (req, res) => {
    try {
       
        const quizzes = await Quiz.find({ classId: req.params.classId })
            .populate("teacherId", "name")
            .sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch quizzes", error: error.message });
    }
};


const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (quiz) {
            await quiz.deleteOne();
            res.json({ message: "Quiz removed" });
        } else {
            res.status(404).json({ message: "Quiz not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to delete quiz", error: error.message });
    }
};

const submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body; // answers: [1, 0, 3, ...] indices
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        let score = 0;
        // Calculate score
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctOption) {
                score++;
            }
        });

        const result = new QuizResult({
            studentId: req.user._id,
            quizId,
            score,
            totalScore: quiz.questions.length,
            answers,
        });

        const savedResult = await result.save();
        res.status(201).json(savedResult);
    } catch (error) {
        res.status(500).json({ message: "Failed to submit quiz", error: error.message });
    }
};
const getMyResults = async (req, res) => {
    try {
        const results = await QuizResult.find({ studentId: req.user._id })
            .populate("quizId", "title")
            .sort({ submittedAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch results", error: error.message });
    }
};

const deleteQuizResult = async (req, res) => {
    try {
        const result = await QuizResult.findById(req.params.id);

        if (!result) {
            return res.status(404).json({ message: "Result not found" });
        }

        // Ensure user owns the result
        if (result.studentId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await result.deleteOne();
        res.json({ message: "History deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete result", error: error.message });
    }
};

module.exports = {
    createQuiz,
    getQuizzesByClass,
    deleteQuiz,
    submitQuiz,
    getMyResults,
    deleteQuizResult,
};
