import { useEffect, useState } from "react";
import api from "../services/api";

function StudentAttendance() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      const res = await api.get("/api/attendance/me");
      setData(res.data);
    };
    fetchAttendance();
  }, []);

  if (!data) {
    return <div>Loading attendance...</div>;
  }

  return (
    <>
      <h3 className="fw-bold mb-3">My Attendance</h3>

      <div
        className="bg-white p-4 shadow-sm mb-4"
        style={{ borderRadius: "8px" }}
      >
        <div className="row">
          <div className="col-md-4">
            <p className="text-muted mb-1">Total Classes</p>
            <h5>{data.total}</h5>
          </div>
          <div className="col-md-4">
            <p className="text-muted mb-1">Present</p>
            <h5>{data.present}</h5>
          </div>
          <div className="col-md-4">
            <p className="text-muted mb-1">Attendance %</p>
            <h5>{data.percentage}%</h5>
          </div>
        </div>
      </div>

      <div
        className="bg-white p-3 shadow-sm"
        style={{ borderRadius: "8px" }}
      >
        <table className="table table-bordered mb-0">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.records.map((r) => (
              <tr key={r._id}>
                <td>{new Date(r.date).toDateString()}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default StudentAttendance;
