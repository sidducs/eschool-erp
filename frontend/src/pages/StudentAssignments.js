import { useState, useEffect, useContext, useCallback } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaCalendarAlt, FaFileAlt, FaFileUpload, FaCheckCircle } from "react-icons/fa";
import Loader from "../components/Loader";

function StudentAssignments() {
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Modal State
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [file, setFile] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const classId = user.classId?._id || user.classId;
            if (!classId) return;

            const [assignRes, subRes] = await Promise.all([
                api.get(`/api/assignments/class/${classId}`),
                api.get("/api/submissions/my")
            ]);

            setAssignments(assignRes.data);
            setSubmissions(subRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);

    const getSubmission = (assignmentId) => {
        return submissions.find(s => s.assignmentId._id === assignmentId || s.assignmentId === assignmentId);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            addToast("Please select a file to upload", "error");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append("file", file); // 'file' matches the upload middleware field

            // We use the generalized upload endpoint if available, strictly speaking we should use the same one as before.
            // But wait, the previous upload used 'attachment' as fieldname for assignments.
            // Let's check api/upload. It usually expects 'file'.
            // I'll stick to a standard upload pattern: Upload to cloudinary -> get URL -> Submit to backend.

            // NOTE: I am using the existing generalized upload route if possible, or I can use a direct call.
            // Let's assume /api/upload exists and works for generic files. 
            // If not, I'll need to use the specific one. 
            // Reviewing fileUpload.js (middleware), it handles 'image', 'file', 'attachment'.
            // I will use a helper route or just create a quick submission with file.

            // Actually, let's look at `submissionController`. It expects `fileUrl`.
            // So I need to upload first. 
            // I will use `/api/upload` endpoint if I made one. 
            // Wait, I don't recall creating a generic `/api/upload` route that returns a URL. 
            // `TeacherAssignments` posted to `/api/assignments/create` which handled the upload internally via middleware.

            // I should probably make a generic upload endpoint.
            // OR I can modify the submit endpoint to handle multipart/form-data.
            // MODIFYING THE ENDPOINT IS SAFER given I didn't create a generic upload tool.

            // But `submissionController.js` (Step 4269) expects `req.body.fileUrl`.
            // So I definitely need a way to get a URL.

            // Let's create a quick utilitarian generic upload endpoint in server logic? 
            // No, better to update `submissionRoutes` to use `fileUpload.single("file")` and generic upload handler.

            // WAIT. I can't easily change the backend *now* without context switching.
            // Actually, I can just update `submissionRoutes.js` and `submissionController.js` to handle file upload directly.
            // It's cleaner.

            // However, for now, let's assume I will Fix the backend to handle file upload in the next step.
            // I will write the frontend to send FormData.

            const uploadData = new FormData();
            uploadData.append("file", file);

            // Temporary: I will assume I'll create /api/common/upload
            const uploadRes = await api.post("/api/common/upload", uploadData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const fileUrl = uploadRes.data.url;

            // 2. Submit Assignment
            await api.post("/api/submissions/submit", {
                assignmentId: selectedAssignment._id,
                fileUrl
            });

            addToast("Assignment submitted successfully!", "success");
            setSelectedAssignment(null);
            setFile(null);
            fetchData(); // Refresh to show "Submitted" status
        } catch (err) {
            console.error(err);
            addToast("Failed to submit assignment", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader text="Loading Assignments..." />;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <FaFileAlt className="text-indigo-600" /> Class Assignments
            </h1>

            {assignments.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <FaFileAlt size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No Assignments Yet</h3>
                    <p className="text-slate-500">You are all caught up! Check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((assign) => {
                        const submission = getSubmission(assign._id);
                        const isLate = new Date() > new Date(assign.dueDate);

                        return (
                            <div key={assign._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                        {assign.subject}
                                    </span>
                                    {submission ? (
                                        <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${submission.grade ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {submission.grade ? <FaCheckCircle /> : <FaCheckCircle />}
                                            {submission.grade ? "Graded" : "Submitted"}
                                        </span>
                                    ) : (
                                        isLate && <span className="text-xs text-red-500 font-bold">Overdue</span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-2">{assign.title}</h3>
                                <p className="text-slate-600 text-sm mb-6 flex-1">{assign.description}</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className={isLate ? "text-red-400" : "text-orange-400"} />
                                            <span className={isLate ? "text-red-600 font-bold" : ""}>
                                                Due: {new Date(assign.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {assign.attachment && (
                                            <a
                                                href={assign.attachment}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm"
                                            >
                                                <FaFileAlt /> View Material
                                            </a>
                                        )}

                                        {!submission ? (
                                            <button
                                                onClick={() => setSelectedAssignment(assign)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors text-sm"
                                            >
                                                <FaFileUpload /> Submit
                                            </button>
                                        ) : (
                                            <button disabled className="flex-1 bg-green-50 text-green-600 border border-green-200 py-2 rounded-xl font-bold text-sm cursor-default">
                                                Completed
                                            </button>
                                        )}
                                    </div>

                                    {submission && submission.grade && (
                                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                                            <p className="text-sm font-bold text-green-800">Grade: {submission.grade}</p>
                                            {submission.feedback && <p className="text-xs text-green-700 mt-1">"{submission.feedback}"</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Submission Modal */}
            {selectedAssignment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-fadeIn">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Submit Assignment</h2>
                        <p className="text-sm text-slate-500 mb-6">Upload your work for <strong>{selectedAssignment.title}</strong></p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <FaFileUpload className="mx-auto text-slate-400 mb-2" size={32} />
                                <p className="text-sm font-medium text-slate-600">
                                    {file ? file.name : "Click to select or drag file here"}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">PDF, Docs, or Images</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setSelectedAssignment(null); setFile(null); }}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {submitting ? "Uploading..." : "Submit Assignment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentAssignments;
