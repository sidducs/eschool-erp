import { useEffect, useState } from "react";
import api from "../services/api";
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaUserClock, FaExclamationCircle } from "react-icons/fa";

function TeacherAttendance() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/api/classes");
        setClasses(res.data);
      } catch (err) {
        console.error("Failed to fetch classes", err);
      }
    };
    fetchClasses();
  }, []);

  const loadStudents = async (id) => {
    setClassId(id);
    setAttendance({});
    if (!id) {
      setStudents([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/api/classes/${id}/students`);
      setStudents(res.data);
      // Initialize all as Present by default for convenience? Optional.
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  const markStatus = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const submitAttendance = async () => {
    if (!classId || !date) {
      alert("Please select class and date");
      return;
    }

    // Validation: Check if all students are marked
    const unmarked = students.filter(s => !attendance[s._id]);
    if (unmarked.length > 0) {
      if (!window.confirm(`⚠️ You haven't marked attendance for ${unmarked.length} students. They will be ignored. Continue?`)) return;
    }

    try {
      setLoading(true);
      const promises = Object.keys(attendance).map(studentId =>
        api.post("/api/attendance", {
          studentId,
          classId,
          date,
          status: attendance[studentId],
        })
      );
      await Promise.all(promises);
      alert("✅ Attendance submitted successfully!");
    } catch (err) {
      alert("❌ Failed to submit attendance");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "Present", icon: FaCheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    { value: "Absent", icon: FaTimesCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    { value: "Late", icon: FaClock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    { value: "Half-day", icon: FaUserClock, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { value: "Excused", icon: FaExclamationCircle, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  ];

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">
          <FaCalendarAlt size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daily Attendance</h2>
          <p className="text-slate-500 text-sm">Mark student attendance with expanded statuses.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Select Class</label>
          <select
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
            onChange={(e) => loadStudents(e.target.value)}
          >
            <option value="">-- Choose Class --</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                Class {c.name} {c.section} ({c.academicYear})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Attendance Date</label>
          <input
            type="date"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {!classId ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
          <FaCalendarAlt className="mx-auto text-slate-300 text-6xl mb-4" />
          <p className="text-slate-500 font-medium">Please select a class to start marking attendance.</p>
        </div>
      ) : students.length === 0 ? (
        <div className="p-8 text-center text-slate-500 font-medium">
          {loading ? "Loading Students..." : "No students found in this class."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <th className="px-6 py-4 w-24">SRN</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4 text-center">Mark Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-600 font-bold text-xs">{s.admissionId || "N/A"}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap justify-center gap-2">
                        {statusOptions.map((opt) => {
                          const isSelected = attendance[s._id] === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => markStatus(s._id, opt.value)}
                              className={`relative group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all
                                        ${isSelected
                                  ? `${opt.bg} ${opt.border} ${opt.color} ring-1 ring-offset-1 ring-${opt.color.split('-')[1]}-400 shadow-sm`
                                  : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                                }
                                    `}
                              title={opt.value}
                            >
                              <opt.icon className={isSelected ? "" : "opacity-50"} />
                              <span>{opt.value}</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={submitAttendance}
              disabled={loading}
              className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
            >
              {loading ? "Saving..." : <><FaCheckCircle /> Save Attendance Records</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherAttendance;
