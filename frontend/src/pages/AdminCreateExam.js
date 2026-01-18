import { useEffect, useState } from "react";
import api from "../services/api";

function AdminCreateExam() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [subject, setSubject] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [examDate, setExamDate] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await api.get("/api/classes");
      setClasses(res.data);
    };
    fetchClasses();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/exams", {
        name,
        classId,
        subject,
        totalMarks,
        examDate,
      });

      alert("Exam created successfully");

      setName("");
      setClassId("");
      setSubject("");
      setTotalMarks("");
      setExamDate("");
    } catch (error) {
      alert("Failed to create exam");
    }
  };

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">Admin / Exams / Create</div>

      <h3 className="fw-bold mb-4">Create Exam</h3>

      <div
        className="bg-white p-4 shadow-sm"
        style={{ borderRadius: "8px", maxWidth: "560px" }}
      >
        <form onSubmit={submitHandler}>
          <div className="mb-3">
            <label className="form-label">Exam Name</label>
            <input
              className="form-control"
              placeholder="e.g. Midterm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Class</label>
            <select
              className="form-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}-{c.section}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Subject</label>
            <input
              className="form-control"
              placeholder="e.g. Mathematics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Total Marks</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 100"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Exam Date</label>
            <input
              type="date"
              className="form-control"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-dark">
              Create Exam
            </button>
            <button
              type="reset"
              className="btn btn-outline-secondary"
              onClick={() => {
                setName("");
                setClassId("");
                setSubject("");
                setTotalMarks("");
                setExamDate("");
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCreateExam;
