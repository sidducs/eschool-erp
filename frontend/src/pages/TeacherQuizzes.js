import { useState, useEffect } from "react";
import api from "../services/api";
import { FaPlus, FaTrash, FaSave, FaTimes, FaQuestionCircle } from "react-icons/fa";
import Loader from "../components/Loader";
import AlertMessage from "../components/AlertMessage";
import ConfirmationModal from "../components/ConfirmationModal";

function TeacherQuizzes() {
    // const { user } = useContext(AuthContext); // Unused
    const [quizzes, setQuizzes] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: "", msg: "" });
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null, isDanger: false });

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        classId: "",
        questions: [
            { questionText: "", options: ["", "", "", ""], correctOption: 0 } // Default 1 question
        ]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const classRes = await api.get("/api/classes");
            setClasses(classRes.data);
            // For now, fetch quizzes for first class or all (need backend adjustment for 'all', but 'class/:id' works)
            // We will just fetch classes for the dropdown for now.
            // To list quizzes, we might need a route to get "my created quizzes" or iterate classes.
            // For V1, let's fetch quizzes for the first available class if exists, or just wait for user interaction.
            if (classRes.data.length > 0) {
                const quizRes = await api.get(`/api/quizzes/class/${classRes.data[0]._id}`);
                setQuizzes(quizRes.data);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleFetchQuizzes = async (classId) => {
        if (!classId) return;
        try {
            const res = await api.get(`/api/quizzes/class/${classId}`);
            setQuizzes(res.data);
        } catch (err) { console.error(err); }
    }

    const showAlert = (type, msg) => {
        setAlert({ show: true, type, msg });
        setTimeout(() => setAlert({ show: false }), 3000);
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [...formData.questions, { questionText: "", options: ["", "", "", ""], correctOption: 0 }]
        });
    };

    const removeQuestion = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.classId || !formData.title) return showAlert("warning", "Title and Class are required");

        // Basic validation
        for (let q of formData.questions) {
            if (!q.questionText || q.options.some(o => !o.trim())) {
                return showAlert("warning", "All valid questions must have text and 4 options.");
            }
        }

        try {
            await api.post("/api/quizzes/create", formData);
            showAlert("success", "Quiz Created Successfully!");
            setShowForm(false);
            setFormData({ title: "", classId: "", questions: [{ questionText: "", options: ["", "", "", ""], correctOption: 0 }] });
            handleFetchQuizzes(formData.classId); // Refresh list
        } catch (err) {
            showAlert("danger", "Failed to create quiz");
        }
    };

    const confirmDelete = (id) => {
        setModal({
            isOpen: true,
            title: "Delete Quiz",
            message: "Are you sure you want to delete this quiz? This action cannot be undone.",
            confirmText: "Delete",
            isDanger: true,
            onConfirm: () => handleDelete(id)
        });
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/quizzes/${id}`);
            setQuizzes(quizzes.filter(q => q._id !== id));
            showAlert("success", "Quiz Deleted");
        } catch (err) {
            showAlert("danger", "Failed to delete");
        }
    };

    if (loading) return <Loader text="Loading Quizzes..." />;

    return (
        <div className="space-y-6">
            {alert.show && <AlertMessage type={alert.type} message={alert.msg} onClose={() => setAlert({ show: false })} />}

            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
                isDanger={modal.isDanger}
            />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Online Quizzes</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                    {showForm ? <FaTimes /> : <FaPlus />} {showForm ? "Cancel" : "Create Quiz"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fadeIn mb-8">
                    <h3 className="font-bold text-lg mb-4 text-slate-700 border-b pb-2">Create New Quiz</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Quiz Title</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="e.g. Science Chapter 1 Test"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Assign to Class</label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                    value={formData.classId}
                                    onChange={(e) => {
                                        setFormData({ ...formData, classId: e.target.value });
                                        handleFetchQuizzes(e.target.value);
                                    }}
                                    required
                                >
                                    <option value="">Select Class...</option>
                                    {classes.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {formData.questions.map((q, qIndex) => (
                                <div key={qIndex} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-slate-600">Question {qIndex + 1}</span>
                                        {formData.questions.length > 1 && (
                                            <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700">
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        className="w-full p-2 mb-3 border rounded focus:border-purple-500 outline-none"
                                        placeholder="Type your question here..."
                                        value={q.questionText}
                                        onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                                        required
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={q.correctOption === oIndex}
                                                    onChange={() => handleQuestionChange(qIndex, "correctOption", oIndex)}
                                                    className="w-4 h-4 text-purple-600 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    className={`flex-1 p-2 border rounded text-sm ${q.correctOption === oIndex ? 'border-green-500 ring-1 ring-green-500 bg-green-50' : ''}`}
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="text-purple-600 font-bold hover:bg-purple-50 px-4 py-2 rounded flex items-center gap-2"
                            >
                                <FaPlus /> Add Question
                            </button>
                            <button
                                type="submit"
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 shadow-md flex items-center gap-2"
                            >
                                <FaSave /> Publish Quiz
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Quizzes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <FaQuestionCircle className="mx-auto text-4xl text-slate-300 mb-2" />
                        <p className="text-slate-500">No quizzes found for selected class.</p>
                    </div>
                ) : (
                    quizzes.map((quiz) => (
                        <div key={quiz._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-lg text-slate-800">{quiz.title}</h4>
                                <button onClick={() => confirmDelete(quiz._id)} className="text-slate-400 hover:text-red-500">
                                    <FaTrash />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">
                                {quiz.questions.length} Questions • Created {new Date(quiz.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                <span className="bg-slate-100 px-2 py-1 rounded">MCQ</span>
                                <span className="bg-green-50 text-green-600 px-2 py-1 rounded">Auto-Graded</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default TeacherQuizzes;
