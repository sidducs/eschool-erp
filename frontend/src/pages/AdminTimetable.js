import { useEffect, useState } from "react";
import api from "../services/api";

function AdminTimetable() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState({
    classId: "",
    day: "Monday",
    timeSlot: "",
    subject: "",
    teacher: "",
  });

  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const c = await api.get("/api/classes");
      const t = await api.get("/api/admin/users");

      const teacherList = (t.data || []).filter((u) => u.role === "teacher");

      setClasses(c.data || []);
      setTeachers(teacherList);

      setForm((f) => ({
        ...f,
        classId: c.data?.[0]?._id || "",
        teacher: teacherList?.[0]?._id || "",
      }));
    };
    load();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/timetable", form);
      setMsg("Timetable entry created");
      setForm({ ...form, subject: "", timeSlot: "" });
    } catch (err) {
      setMsg(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="container p-4">
      <h4 className="mb-3">Create Timetable</h4>
      {msg && <div className="alert alert-info">{msg}</div>}

      <form onSubmit={submit} style={{ maxWidth: 520 }}>
        <div className="mb-2">
          <label className="form-label">Class</label>
          <select
            name="classId"
            className="form-select"
            onChange={handleChange}
            value={form.classId}
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}-{c.section}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label">Day</label>
          <select
            name="day"
            className="form-select"
            onChange={handleChange}
            value={form.day}
          >
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(
              (d) => (
                <option key={d}>{d}</option>
              )
            )}
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label">Time Slot</label>
          <input
            name="timeSlot"
            className="form-control"
            placeholder="Eg: 09:00 - 09:50"
            onChange={handleChange}
            value={form.timeSlot}
            required
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Subject</label>
          <input
            name="subject"
            className="form-control"
            placeholder="Eg: Mathematics"
            onChange={handleChange}
            value={form.subject}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Teacher</label>
          <select
            name="teacher"
            className="form-select"
            onChange={handleChange}
            value={form.teacher}
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-dark">Save Timetable</button>
      </form>
    </div>
  );
}

export default AdminTimetable;
