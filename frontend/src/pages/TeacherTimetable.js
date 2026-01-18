import { useEffect, useState } from "react";
import api from "../services/api";

function TeacherTimetable() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/timetable/teacher");
        setData(res.data || []);
      } catch {
        setError("Failed to load timetable");
      }
    };

    load();
  }, []);

  return (
    <div className="container p-4">
      <h4 className="mb-3">My Teaching Schedule</h4>

      {error && <div className="alert alert-warning">{error}</div>}

      {!error && data.length === 0 && (
        <div className="alert alert-info">No schedule assigned</div>
      )}

      {data.length > 0 && (
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Class</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr key={t._id}>
                <td>{t.day}</td>
                <td>{t.timeSlot?.label || "-"}</td>
                <td>{t.classId?.name || "-"}</td>
                <td>{t.subject}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TeacherTimetable;
