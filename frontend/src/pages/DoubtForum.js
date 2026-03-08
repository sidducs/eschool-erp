import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaPlus, FaComments } from "react-icons/fa";
import Loader from "../components/Loader";

function DoubtForum() {
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();
    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filter toggle
    const [showResolved, setShowResolved] = useState(false);

    // New Doubt Form
    const [formData, setFormData] = useState({
        subject: "",
        question: "",
        description: ""
    });

    // Answering
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        fetchDoubts();
    }, []);

    const fetchDoubts = async () => {
        try {
            const res = await api.get("/api/doubts");
            setDoubts(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load doubts");
            setLoading(false);
        }
    };

    const handleAskSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post("/api/doubts", formData);
            setDoubts([res.data, ...doubts]); // Add to top
            addToast("Doubt posted successfully", "success");
            setShowModal(false);
            setFormData({ subject: "", question: "", description: "" });
        } catch (err) {
            addToast("Failed to post doubt", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReplySubmit = async (doubtId) => {
        if (!replyText.trim()) return;
        try {
            const res = await api.post(`/api/doubts/${doubtId}/answer`, { answerText: replyText });
            // Update local state
            setDoubts(doubts.map(d => d._id === doubtId ? res.data : d));
            setReplyText("");
            setReplyingTo(null);
            addToast("Reply added", "success");
        } catch (err) {
            addToast("Failed to add reply", "error");
        }
    };

    if (loading) return <Loader text="Loading Forum..." />;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FaComments className="text-indigo-600" /> Discussion Forum
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowResolved(!showResolved)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition ${showResolved ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                        {showResolved ? "Showing All" : "Hide Resolved"}
                    </button>
                    {user.role === "student" && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm"
                        >
                            <FaPlus /> Ask Doubt
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {doubts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaComments size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No doubts raised yet</h3>
                        <p className="text-slate-500">Be the first to start a discussion!</p>
                    </div>
                ) : (
                    doubts
                        .filter(d => showResolved ? true : !d.isResolved)
                        .map(doubt => (
                            <div key={doubt._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                {doubt.studentId?.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg">{doubt.studentId?.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                                                        {doubt.subject}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        • {new Date(doubt.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{doubt.question}</h3>
                                    <p className="text-slate-600 mb-6 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        {doubt.description}
                                    </p>

                                    {/* Answers Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-px flex-1 bg-slate-100"></div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                {doubt.answers.length} {doubt.answers.length === 1 ? 'Response' : 'Responses'}
                                            </span>
                                            <div className="h-px flex-1 bg-slate-100"></div>
                                        </div>

                                        {doubt.answers.map((ans, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${ans.user?.role === 'teacher' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {ans.user?.name?.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="bg-slate-50 rounded-2xl rounded-tl-none p-3 border border-slate-100 inline-block max-w-[90%]">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`font-bold text-sm ${ans.user?.role === 'teacher' ? 'text-orange-700' : 'text-slate-700'}`}>
                                                                {ans.user?.name}
                                                            </span>
                                                            {ans.user?.role === 'teacher' && (
                                                                <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold uppercase">
                                                                    Teacher
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-slate-700 text-sm">{ans.text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Reply Box */}
                                        <div className="mt-4 pt-4 border-t border-slate-50 pl-4 md:pl-12">
                                            {replyingTo === doubt._id ? (
                                                <div className="flex gap-3 animate-fadeIn">
                                                    <input
                                                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors"
                                                        placeholder="Type your answer..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleReplySubmit(doubt._id)}
                                                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
                                                    >
                                                        Post
                                                    </button>
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="text-slate-400 hover:text-slate-600 text-sm px-2"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setReplyingTo(doubt._id)}
                                                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition py-2"
                                                >
                                                    <FaPlus size={12} /> Add an answer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                )}
            </div>

            {/* Ask Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-fadeIn">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Ask a Doubt</h2>
                        <form onSubmit={handleAskSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                <input
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="e.g. Science"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                                <input
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    placeholder="What is the speed of light?"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                                <textarea
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Add more details..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{submitting ? "Posting..." : "Post Doubt"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoubtForum;
