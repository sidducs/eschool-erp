import { useEffect, useState } from "react";
import api from "../services/api";
import { FaSave, FaBook, FaCalculator, FaClipboardCheck } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "../components/ConfirmationModal";

function TeacherEnterMarks() {
  const { addToast } = useToast();
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [examId, setExamId] = useState("");
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null, isDanger: false });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get("/api/exams");
        setExams(res.data);
      } catch (err) {
        console.error("Failed to load exams", err);
      }
    };
    fetchExams();
  }, []);

  const fetchStudents = async (selectedExamId) => {
    const exam = exams.find((e) => e._id === selectedExamId);
    if (!exam || !exam.classId || !exam.classId._id) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/api/users/students-by-class?classId=${exam.classId._id}`
      );
      setStudents(res.data);
      setMarks({}); // Reset marks when changing exam
    } catch {
      addToast("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (mark) => {
    if (!mark && mark !== 0) return "-";
    const m = Number(mark);
    if (m >= 90) return "A+";
    if (m >= 80) return "A";
    if (m >= 70) return "B";
    if (m >= 60) return "C";
    if (m >= 50) return "D";
    return "F";
  };

  const calculateStatus = (mark) => (Number(mark) >= 35 ? "Pass" : "Fail");

  const handleMarkChange = (studentId, value) => {
    setMarks({
      ...marks,
      [studentId]: value
    });
  };

  const confirmSubmit = () => {
    setModal({
      isOpen: true,
      title: "Save Marks",
      message: "Are you sure you want to save these marks? This will update the student results and cannot be easily undone.",
      confirmText: "Save Results",
      isDanger: false,
      onConfirm: submitMarks
    });
  };

  const submitMarks = async () => {
    const selectedExam = exams.find(e => e._id === examId);
    const maxMarks = selectedExam ? selectedExam.totalMarks : 100;

    setLoading(true);
    try {
      for (let student of students) {
        const mark = marks[student._id];
        if (mark === undefined || mark === "") continue;

        if (Number(mark) > maxMarks) {
          addToast(`Error: Marks for ${student.name} cannot exceed ${maxMarks}`, "error");
          setLoading(false);
          return;
        }

        const calculatedGrade = calculateGrade(mark);

        await api.post("/api/results", {
          examId,
          studentId: student._id,
          marksObtained: Number(mark),
          status: calculateStatus(mark),
          grade: calculatedGrade,
          remarks: "Participated." // Default simplified remark
        });
      }

      addToast("Marks & Grades submitted successfully!", "success");
    } catch (error) {
      console.error(error);
      addToast("Error submitting marks", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        isDanger={modal.isDanger}
      />

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">
          <FaClipboardCheck size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Enter Exam Marks</h2>
          <p className="text-slate-500 text-sm">Input marks and auto-calculate grades.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Select Examination</label>
        <div className="relative">
          <FaBook className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <select
            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            value={examId}
            onChange={(e) => {
              setExamId(e.target.value);
              fetchStudents(e.target.value);
            }}
          >
            <option value="">-- Choose Exam To Grade --</option>
            {exams.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name} - {e.subject} (Max: {e.totalMarks})
              </option>
            ))}
          </select>
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4 w-32">Marks Obtained</th>
                  <th className="px-6 py-4 w-24 text-center">Grade</th>
                  <th className="px-6 py-4 w-32 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const mark = marks[s._id] || "";
                  const grade = calculateGrade(mark);
                  const status = calculateStatus(mark);
                  const isFail = status === "Fail";

                  return (
                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{s.name}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-center font-bold"
                          value={mark}
                          onChange={(e) => handleMarkChange(s._id, e.target.value)}
                          placeholder="0"
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${isFail ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {mark !== "" && (
                          <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${isFail ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                            {status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={confirmSubmit}
              disabled={loading}
              className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
            >
              {loading ? "Submitting..." : <><FaSave /> Save Results</>}
            </button>
          </div>
        </div>
      )}

      {!examId && (
        <div className="text-center py-20 opacity-50">
          <FaCalculator className="text-6xl mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-medium">Select an exam above to start grading.</p>
        </div>
      )}
    </div>
  );
}

export default TeacherEnterMarks;
