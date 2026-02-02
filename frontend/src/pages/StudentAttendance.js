import { useEffect, useState } from "react";
import api from "../services/api";

function StudentAttendance() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/api/attendance/me");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch attendance", err);
      }
    };
    fetchAttendance();
  }, []);

  if (!data) {
    return <div className="p-4 text-center text-slate-500 font-medium animate-pulse">Loading attendance records...</div>;
  }

  return (
    <div className="animate-fadeIn">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
        My Attendance
      </h3>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="text-center p-2">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Total Classes</p>
            <h5 className="text-3xl font-extrabold text-slate-800">{data.total}</h5>
          </div>
          <div className="text-center p-2">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Present</p>
            <h5 className="text-3xl font-extrabold text-green-600">{data.present}</h5>
          </div>
          <div className="text-center p-2">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Attendance Rate</p>
            <h5 className={`text-3xl font-extrabold ${Number(data.percentage) >= 75 ? "text-blue-600" : "text-amber-500"}`}>
              {data.percentage}%
            </h5>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.records.length > 0 ? (
                data.records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{new Date(r.date).toDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${r.status === 'Present'
                          ? "bg-green-100 text-green-800"
                          : r.status === 'Absent'
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-800"
                        }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-slate-400 italic">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentAttendance;
