import { useEffect, useState } from "react";
import api from "../services/api";
import { FaClock, FaCalendarAlt, FaLayerGroup } from "react-icons/fa";

function TeacherTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/timetable/teacher");
        setTimetable(res.data || []);
      } catch {
        setError("Failed to load your schedule.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Helper to sort by Day then Time
  const sortedTimetable = [...timetable]
    .filter(t => selectedDay === "All" || t.day === selectedDay)
    .sort((a, b) => {
      const dayA = days.indexOf(a.day);
      const dayB = days.indexOf(b.day);
      if (dayA !== dayB) return dayA - dayB;

      // Heuristic for time sorting: Treat 01-07 as PM (13-19)
      const parseTime = (t) => {
        if (!t) return 0;
        const part = t.split("-")[0].trim(); // Get start time
        let [h, m] = part.split(":").map(Number);
        if (h >= 1 && h <= 7) h += 12; // Assume 1-7 is PM
        return h * 60 + (m || 0);
      };

      return parseTime(a.timeSlot) - parseTime(b.timeSlot);
    });

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse flex flex-col items-center"><FaClock className="mb-2 text-2xl" /> Loading schedule...</div>;
  }

  return (
    <div className="flex flex-col gap-4 animate-fadeIn max-w-7xl mx-auto p-4">
      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" /> My Teaching Schedule
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 uppercase">Filter Day:</label>
          <select
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="All">All Days</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm font-bold shadow-sm max-w-md">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <th className="px-6 py-4">Day</th>
                  <th className="px-6 py-4">Time Slot</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTimetable.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">
                      No classes scheduled yet.
                    </td>
                  </tr>
                ) : (
                  sortedTimetable.map((slot) => (
                    <tr key={slot._id} className="hover:bg-blue-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-700 bg-slate-50/50 w-32 border-r border-slate-100">{slot.day}</td>
                      <td className="px-6 py-4 text-blue-600 font-semibold text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaClock size={12} className="opacity-50" /> {slot.timeSlot}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-base">{slot.subject}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-2 bg-slate-100 w-fit px-3 py-1 rounded-full text-xs font-bold">
                          <FaLayerGroup size={12} className="text-slate-400" />
                          {slot.classId?.name} - {slot.classId?.section}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherTimetable;
