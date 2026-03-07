import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { FaClipboardList, FaChartPie, FaPrint } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import StudentReportCard from "./StudentReportCard";

function StudentResults({ studentId }) {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportCard, setShowReportCard] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        let endpoint = "/api/results/student";
        if (studentId) {
          endpoint = `/api/results/student/${studentId}`;
        }

        const res = await api.get(endpoint);
        setResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [studentId]);

  // Helper for color based on percentage
  const getColorClass = (pct) => {
    if (pct >= 90) return "bg-green-500";
    if (pct >= 75) return "bg-blue-500";
    if (pct >= 60) return "bg-teal-500";
    if (pct >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const getBadgeClass = (status) => {
    return status === "Pass"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading results...</div>;

  if (showReportCard) {
    return <StudentReportCard student={user} results={results} onBack={() => setShowReportCard(false)} />;
  }

  return (
    <div className="animate-fadeIn w-full">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl shadow-sm">
            <FaClipboardList size={22} />
          </div>
          <div>
            <h5 className="text-xl font-bold text-slate-800">My Results</h5>
            <p className="text-sm text-slate-500">Academic Performance History</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <span className="hidden sm:inline-flex items-center bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
            <FaChartPie className="mr-2 text-indigo-500" /> Total Exams: {results.length}
          </span>
          {results.length > 0 && (
            <button
              onClick={() => setShowReportCard(true)}
              className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 transition-all"
            >
              <FaPrint /> Report Card
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      {results.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <div className="text-slate-400 mb-3"><FaClipboardList size={40} className="mx-auto opacity-50" /></div>
          <p className="text-slate-500 font-medium">No exam results published yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                  <th className="pl-6 py-4">Exam Name</th>
                  <th className="px-4 py-4">Subject</th>
                  <th className="px-4 py-4">Marks</th>
                  <th className="px-4 py-4 w-1/4">Progress</th>
                  <th className="px-4 py-4 text-center">Grade</th>
                  <th className="pr-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r, index) => {
                  const barColor = getColorClass(r.percentage);

                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="pl-6 py-4 font-bold text-slate-800">{r.examName || "Term Exam"}</td>
                      <td className="px-4 py-4 text-slate-600 font-medium">{r.subject || "General"}</td>

                      {/* Marks */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-800">{r.marksObtained}</span>
                        <span className="text-slate-400 text-xs"> / {r.totalMarks}</span>
                      </td>

                      {/* Progress Bar */}
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-600">{r.percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${r.percentage}%` }}
                            className={`h-full rounded-full ${barColor}`}
                          ></div>
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200">
                          {r.grade || "-"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="pr-6 py-4 text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getBadgeClass(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentResults;