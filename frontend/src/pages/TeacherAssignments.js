import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
// AuthContext unused if user is unused, but maybe we keep it for consistency or valid token check if needed? 
// The warning said 'user' is unused.
import { useToast } from "../context/ToastContext";
import { FaPlus, FaTrash, FaDownload, FaEye, FaCheckCircle } from "react-icons/fa";
import Loader from "../components/Loader";
import ConfirmationModal from "../components/ConfirmationModal";

function TeacherAssignments() {
    const { addToast } = useToast();

    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [gradingSubmission, setGradingSubmission] = useState(null); // The specific submission being graded
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null, isDanger: false });

    const [submitting, setSubmitting] = useState(false);

    // Create Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject: "",
        classId: "",
        dueDate: "",
        attachment: null
    });

    // Grade Form State
    const [gradeData, setGradeData] = useState({
        grade: "",
        feedback: ""
    });

    const fetchData = useCallback(async () => {
        try {
            const [classesRes, assignmentsRes] = await Promise.all([
                api.get("/api/classes"),
                api.get("/api/assignments/teacher/my-assignments")
            ]);
            setClasses(classesRes.data);
            setAssignments(assignmentsRes.data);
        } catch (err) {
            addToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, attachment: e.target.files[0] });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("subject", formData.subject);
        data.append("classId", formData.classId);
        data.append("dueDate", formData.dueDate);
        if (formData.attachment) {
            data.append("attachment", formData.attachment);
        }

        try {
            await api.post("/api/assignments/create", data);
            addToast("Assignment created successfully", "success");
            setShowCreateModal(false);
            setFormData({ title: "", description: "", subject: "", classId: "", dueDate: "", attachment: null });
            fetchData();
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to create assignment", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async (id) => {
        try {
            await api.delete(`/api/assignments/${id}`);
            addToast("Assignment deleted", "success");
            setAssignments(assignments.filter(a => a._id !== id));
        } catch (err) {
            addToast("Failed to delete", "error");
        }
    };

    const handleDelete = (id) => {
        setModal({
            isOpen: true,
            title: "Delete Assignment",
            message: "Are you sure you want to delete this assignment? This action cannot be undone.",
            confirmText: "Delete",
            isDanger: true,
            onConfirm: () => confirmDelete(id)
        });
    };

    const openSubmissions = async (assignment) => {
        setSelectedAssignment(assignment);
        setShowSubmissionsModal(true);
        setSubmissions([]); // Clear previous
        try {
            const res = await api.get(`/api/submissions/assignment/${assignment._id}`);
            setSubmissions(res.data);
        } catch (err) {
            addToast("Failed to load submissions", "error");
        }
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        if (!gradingSubmission) return;

        try {
            await api.put(`/api/submissions/${gradingSubmission._id}/grade`, gradeData);
            addToast("Graded successfully", "success");

            // Update local state
            setSubmissions(submissions.map(s =>
                s._id === gradingSubmission._id ? { ...s, grade: gradeData.grade, feedback: gradeData.feedback, status: "graded" } : s
            ));
            setGradingSubmission(null);
            setGradeData({ grade: "", feedback: "" });
        } catch (err) {
            addToast("Failed to grade", "error");
        }
    };

    if (loading) return <Loader text="Loading Assignments..." />;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
                isDanger={modal.isDanger}
            />
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">My Assignments</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm"
                >
                    <FaPlus /> Create Assignment
                </button>
            </div>

            {/* Assignments List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100">
                        No active assignments found. Create one to get started!
                    </div>
                ) : (
                    assignments.map((assignment) => (
                        <div key={assignment._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full relative group hover:shadow-md transition">
                            <button
                                onClick={() => handleDelete(assignment._id)}
                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition"
                                title="Delete Assignment"
                            >
                                <FaTrash />
                            </button>

                            <div className="mb-4">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase">
                                    {assignment.subject}
                                </span>
                                <span className="ml-2 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                    {assignment.classId?.name}-{assignment.classId?.section}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-2">{assignment.title}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{assignment.description || "No description provided."}</p>

                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    onClick={() => openSubmissions(assignment)}
                                    className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition"
                                >
                                    <FaEye /> View Submissions
                                </button>

                                {assignment.attachment && (
                                    <a
                                        href={assignment.attachment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-400 hover:text-indigo-600 transition"
                                        title="Download Attachment"
                                    >
                                        <FaDownload />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Create New Assignment</h2>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input name="title" value={formData.title} onChange={handleCreateInputChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                                    <select name="classId" value={formData.classId} onChange={handleCreateInputChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" required>
                                        <option value="">Select Class</option>
                                        {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                    <input name="subject" value={formData.subject} onChange={handleCreateInputChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Math" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleCreateInputChange} rows="3" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleCreateInputChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Attachment</label>
                                    <input type="file" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{submitting ? "Creating..." : "Create Assignment"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Submissions Modal */}
            {showSubmissionsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-xl animate-fadeIn max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Submissions</h2>
                                <p className="text-sm text-slate-500">for {selectedAssignment?.title}</p>
                            </div>
                            <button onClick={() => setShowSubmissionsModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {submissions.length === 0 ? (
                                <p className="text-center text-slate-500 py-10">No submissions yet.</p>
                            ) : (
                                submissions.map(sub => (
                                    <div key={sub._id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                                {sub.studentId?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{sub.studentId?.name}</h4>
                                                <p className="text-xs text-slate-500">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <a
                                                href={sub.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                <FaDownload size={12} /> View File
                                            </a>

                                            {sub.status === "graded" ? (
                                                <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                                                    <FaCheckCircle /> {sub.grade}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setGradingSubmission(sub); setGradeData({ grade: sub.grade || "", feedback: sub.feedback || "" }); }}
                                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                                                >
                                                    Grade
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Grading Modal (Nested or separate, using separate for cleaner Z-index) */}
            {gradingSubmission && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fadeIn">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Grade {gradingSubmission.studentId?.name}'s Work</h3>
                        <form onSubmit={handleGradeSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Grade / Score</label>
                                <input
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                    value={gradeData.grade}
                                    onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                                    placeholder="e.g. A, 90/100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Feedback (Optional)</label>
                                <textarea
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                    rows="3"
                                    value={gradeData.feedback}
                                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                    placeholder="Good work, but..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setGradingSubmission(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Submit Grade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeacherAssignments;
