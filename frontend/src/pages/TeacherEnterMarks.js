import { useEffect, useState } from "react";
import api from "../services/api";

function TeacherEnterMarks() {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [examId, setExamId] = useState("");
  const [marks, setMarks] = useState({});

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get("/api/exams");
        setExams(res.data);
      } catch {
        alert("Failed to load exams");
      }
    };
    fetchExams();
  }, []);

  const fetchStudents = async (selectedExamId) => {
    const exam = exams.find((e) => e._id === selectedExamId);
    if (!exam || !exam.classId || !exam.classId._id) return;

    try {
      const res = await api.get(
        `/api/users/students-by-class?classId=${exam.classId._id}`
      );
      setStudents(res.data);
    } catch {
      alert("Failed to load students");
    }
  };

  const submitMarks = async () => {
    try {
      for (let student of students) {
        const mark = marks[student._id];
        if (mark === undefined || mark === "") continue;

        await api.post("/api/results", {
          examId,
          studentId: student._id,
          marksObtained: Number(mark),
        });
      }

      alert("Marks submitted successfully");
    } catch (error) {
      console.error(error);
      alert("Error submitting marks");
    }
  };

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">Teacher / Exams / Marks</div>
      <h3 className="fw-bold mb-4">Enter Marks</h3>

      <div
        className="bg-white p-4 shadow-sm"
        style={{ borderRadius: "8px", maxWidth: "900px" }}
      >
        {/* Exam Dropdown */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Select Exam</label>
          <select
            className="form-control"
            value={examId}
            onChange={(e) => {
              setExamId(e.target.value);
              fetchStudents(e.target.value);
            }}
          >
            <option value="">Choose exam</option>
            {exams.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name} - {e.subject}
              </option>
            ))}
          </select>
        </div>

        {/* Students Table */}
        {students.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-3">
                <thead className="table-light">
                  <tr>
                    <th>Student Name</th>
                    <th style={{ width: "180px" }}>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={marks[s._id] || ""}
                          onChange={(e) =>
                            setMarks({
                              ...marks,
                              [s._id]: e.target.value,
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="btn btn-dark" onClick={submitMarks}>
              Submit Marks
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TeacherEnterMarks;
