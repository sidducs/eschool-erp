import { useEffect, useState } from "react";
import api from "../services/api";

function AdminTimeSlots() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ label: "", order: "" });
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await api.get("/api/timeslots");
    setSlots(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/timeslots", form);
      setForm({ label: "", order: "" });
      setMsg("Time slot added");
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="container p-4">
      <h4>Time Slots</h4>
      {msg && <div className="alert alert-info">{msg}</div>}

      <form onSubmit={submit} className="mb-3" style={{ maxWidth: 400 }}>
        <input
          className="form-control mb-2"
          placeholder="08:45 - 09:45"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          required
        />
        <input
          type="number"
          className="form-control mb-2"
          placeholder="Order (1,2,3...)"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: e.target.value })}
          required
        />
        <button className="btn btn-primary">Add</button>
      </form>

      <ul className="list-group">
        {slots.map((s) => (
          <li key={s._id} className="list-group-item">
            {s.order}. {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminTimeSlots;
