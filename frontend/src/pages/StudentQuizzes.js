import { useState, useEffect } from "react";
import api from "../services/api";

import { FaTimesCircle, FaHistory, FaTrophy, FaPlay, FaTrash } from "react-icons/fa";
import Loader from "../components/Loader";
import ConfirmationModal from "../components/ConfirmationModal";

function StudentQuizzes() {
    // Removed unused AuthContext destructuring
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeQuiz, setActiveQuiz] = useState(null); // The quiz currently being taken
    const [answers, setAnswers] = useState({}); // { qIndex: optionIndex }
    const [result, setResult] = useState(null); // { score, totalScore, ... } upon submission
    const [myResults, setMyResults] = useState([]);
    const [viewMode, setViewMode] = useState("list"); // 'list', 'taking', 'result'

    const [showRetakeModal, setShowRetakeModal] = useState(false);
    const [quizToRetake, setQuizToRetake] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null, isDanger: false });

    useEffect(() => {
        fetchQuizzes();
        fetchMyResults();
    }, []);

    const fetchQuizzes = async () => {
        try {
            // Assuming user.classId is available or we fetch via user profile
            const profileRes = await api.get("/api/auth/profile");
            const classId = profileRes.data.classId?._id || profileRes.data.classId;

            if (classId) {
                const res = await api.get(`/api/quizzes/class/${classId}`);
                setQuizzes(res.data);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchMyResults = async () => {
        try {
            const res = await api.get("/api/quizzes/results/my-results");
            setMyResults(res.data);
        } catch (err) { }
    };

    const startQuiz = (quiz) => {
        const alreadyTaken = myResults.some(r => r.quizId._id === quiz._id);
        if (alreadyTaken) {
            setQuizToRetake(quiz);
            setShowRetakeModal(true);
            return;
        }
        initializeQuiz(quiz);
    };

    const confirmRetake = () => {
        initializeQuiz(quizToRetake);
        setShowRetakeModal(false);
        setQuizToRetake(null);
    };

    const initializeQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setAnswers({});
        setResult(null);
        setViewMode("taking");
    };

    const handleAnswer = (qIndex, oIndex) => {
        setAnswers({ ...answers, [qIndex]: oIndex });
    };

    const confirmSubmit = async () => {
        try {
            // Convert answers object to array based on indices
            const answersArray = activeQuiz.questions.map((_, i) => answers[i] !== undefined ? answers[i] : -1);

            const res = await api.post("/api/quizzes/submit", {
                quizId: activeQuiz._id,
                answers: answersArray
            });

            setResult(res.data);
            setViewMode("result");
            fetchMyResults(); // Refresh history
        } catch (err) {
            alert("Submission failed");
        }
    };

    const submitQuiz = async () => {
        if (Object.keys(answers).length < activeQuiz.questions.length) {
            setModal({
                isOpen: true,
                title: "Incomplete Answers",
                message: "You haven't answered all questions. Are you sure you want to submit anyway?",
                confirmText: "Submit",
                isDanger: true,
                onConfirm: confirmSubmit
            });
            return;
        }
        confirmSubmit();
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return "text-green-600";
        if (percentage >= 50) return "text-orange-500";
        return "text-red-500";
    }

    if (loading) return <Loader text="Loading Quizzes..." />;

    // RENDER: QUIZ TAKING MODE
    if (viewMode === "taking" && activeQuiz) {
        return (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
                <ConfirmationModal
                    isOpen={modal.isOpen}
                    onClose={() => setModal({ ...modal, isOpen: false })}
                    onConfirm={modal.onConfirm}
                    title={modal.title}
                    message={modal.message}
                    confirmText={modal.confirmText}
                    isDanger={modal.isDanger}
                />
                <div className="bg-purple-600 p-6 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
                    <button onClick={() => setViewMode("list")} className="text-purple-200 hover:text-white"><FaTimesCircle size={24} /></button>
                </div>
                <div className="p-6 space-y-8">
                    {activeQuiz.questions.map((q, i) => (
                        <div key={i} className="border-b border-slate-100 pb-6 last:border-0">
                            <p className="font-bold text-lg text-slate-800 mb-4">{i + 1}. {q.questionText}</p>
                            <div className="space-y-3">
                                {q.options.map((opt, oIndex) => (
                                    <label key={oIndex} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${answers[i] === oIndex ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500" : "border-slate-200 hover:bg-slate-50"}`}>
                                        <input
                                            type="radio"
                                            name={`q-${i}`}
                                            className="hidden"
                                            checked={answers[i] === oIndex}
                                            onChange={() => handleAnswer(i, oIndex)}
                                        />
                                        <div className={`w-5 h-5 rounded-full border border-slate-300 mr-3 flex items-center justify-center ${answers[i] === oIndex ? "bg-purple-600 border-purple-600" : ""}`}>
                                            {answers[i] === oIndex && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <span className="text-slate-700">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="pt-4">
                        <button onClick={submitQuiz} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-purple-700 shadow-lg transition transform hover:scale-[1.01]">
                            Submit Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: RESULT MODE
    if (viewMode === "result" && result) {
        const percentage = Math.round((result.score / result.totalScore) * 100);
        return (
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn text-center p-8">
                <div className="mb-6 flex justify-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4 ${percentage >= 50 ? 'border-green-100 bg-green-50 text-green-600' : 'border-red-100 bg-red-50 text-red-600'}`}>
                        {percentage >= 50 ? <FaTrophy /> : <FaHistory />}
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
                <p className="text-slate-500 mb-6">You scored</p>
                <div className="text-5xl font-black mb-2 text-slate-900">{result.score}<span className="text-2xl text-slate-400 font-medium">/{result.totalScore}</span></div>
                <p className={`text-lg font-bold mb-8 ${getScoreColor(percentage)}`}>{percentage}% - {percentage >= 50 ? "Great Job!" : "Keep Studying!"}</p>

                <button onClick={() => setViewMode("list")} className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition">
                    Back to Quizzes
                </button>
            </div>
        )
    }



    // Render Modal at bottom
    return (
        <div className="space-y-8">
            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
                isDanger={modal.isDanger}
            />
            {/* Modal for Retake Confirmation */}
            {showRetakeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                <FaHistory className="text-amber-500 text-xl" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Retake Quiz?</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                You have already completed <strong>{quizToRetake?.title}</strong>.
                                Do you want to take it again to improve your score?
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowRetakeModal(false)}
                                    className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRetake}
                                    className="flex-1 py-2 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition shadow-md shadow-amber-200"
                                >
                                    Retake It
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Available Quizzes */}
            <div>
                <h3 className="font-bold text-xl text-slate-800 mb-4 flex items-center gap-2">
                    <FaPlay className="text-purple-600" /> Available Quizzes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.length === 0 ? (
                        <p className="col-span-full text-slate-500 italic">No active quizzes for your class right now.</p>
                    ) : (
                        quizzes.map(q => (
                            <div key={q._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-lg text-slate-800 group-hover:text-purple-600 transition">{q.title}</h4>
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">{q.questions.length} Qs</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4">Posted by {q.teacherId?.name || "Teacher"}</p>
                                <button onClick={() => startQuiz(q)} className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition">
                                    Start Quiz
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Past Results */}
            {myResults.length > 0 && (
                <div>
                    <h3 className="font-bold text-xl text-slate-800 mb-4 flex items-center gap-2 border-t border-slate-200 pt-8">
                        <FaHistory className="text-slate-400" /> Your History
                    </h3>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                                <tr>
                                    <th className="p-4">Quiz Title</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Score</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {myResults.map(r => {
                                    const pct = Math.round((r.score / r.totalScore) * 100);
                                    return (
                                        <tr key={r._id} className="hover:bg-slate-50">
                                            <td className="p-4 font-medium text-slate-700">{r.quizId?.title || "Unknown Quiz"}</td>
                                            <td className="p-4 text-slate-500 text-sm">{new Date(r.submittedAt).toLocaleDateString()}</td>
                                            <td className="p-4 font-bold text-slate-900">{r.score}/{r.totalScore} <span className="text-xs text-slate-400 font-normal">({pct}%)</span></td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${pct >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {pct >= 50 ? 'Passed' : 'Failed'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => setModal({
                                                        isOpen: true,
                                                        title: "Delete History?",
                                                        message: "Are you sure you want to delete this result? This cannot be undone.",
                                                        confirmText: "Delete",
                                                        isDanger: true,
                                                        onConfirm: async () => {
                                                            try {
                                                                await api.delete(`/api/quizzes/result/${r._id}`);
                                                                setMyResults(prev => prev.filter(res => res._id !== r._id));
                                                                setModal(prev => ({ ...prev, isOpen: false }));
                                                            } catch (err) {
                                                                alert("Failed to delete result");
                                                            }
                                                        }
                                                    })}
                                                    className="text-slate-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50"
                                                    title="Delete History"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentQuizzes;
