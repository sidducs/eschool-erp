import { useEffect, useState } from "react";
import api from "../services/api";
import { FaCalendarAlt, FaPlus, FaClock, FaChalkboardTeacher, FaExclamationTriangle, FaCheckCircle, FaTrash, FaMagic, FaUserTie, FaPen, FaTimes } from "react-icons/fa";

function AdminTimetable() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [viewMode, setViewMode] = useState("class"); // 'class' or 'teacher'
  const [selectedId, setSelectedId] = useState(""); // ClassID or TeacherID
  const [editingSlot, setEditingSlot] = useState(null);

  const [form, setForm] = useState({
    classId: "",
    day: "Monday",
    timeSlot: "",
    subject: "",
    teacher: "",
  });

  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const c = await api.get("/api/classes");
        const t = await api.get("/api/admin/users");
        setClasses(c.data || []);
        setTeachers((t.data || []).filter((u) => u.role === "teacher"));
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    load();
  }, []);

  const fetchTimetable = async (id, mode = viewMode) => {
    if (!id) return;
    try {
      const endpoint = mode === "class" ? `/api/timetable/class/${id}` : `/api/timetable/teacher/${id}`;
      const res = await api.get(endpoint);
      setTimetable(res.data);
    } catch (err) {
      console.error("Failed to fetch timetable", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectionChange = (e) => {
    const newId = e.target.value;
    setSelectedId(newId);
    setForm(prev => ({ ...prev, [viewMode === "class" ? "classId" : "teacher"]: newId }));
    fetchTimetable(newId);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingSlot) {
        // Update Mode
        await api.put(`/api/timetable/${editingSlot._id}`, form);
        setMsg({ text: "Timetable updated!", type: "success" });
        setEditingSlot(null);
      } else {
        // Create Mode
        await api.post("/api/timetable", form);
        setMsg({ text: "Entry added!", type: "success" });
      }
      fetchTimetable(selectedId);
      // Don't clear everything, keep context
      setForm(prev => ({ ...prev, timeSlot: "", subject: "" }));
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Operation failed", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    }
  };

  const initiateEdit = (slot) => {
    setEditingSlot(slot);
    setForm({
      classId: slot.classId?._id || slot.classId, // Handle populated vs unpopulated
      day: slot.day,
      timeSlot: slot.timeSlot,
      subject: slot.subject,
      teacher: slot.teacher?._id || slot.teacher
    });
    // Ensure the form view matches the edit
    // If viewing by teacher, we might be editing a slot for that teacher
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      await api.delete(`/api/timetable/${id}`);
      setMsg({ text: "Slot deleted", type: "success" });
      fetchTimetable(selectedId);
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];



  const [selectedDay, setSelectedDay] = useState("All");

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" /> Timetable Management
          </h2>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">

        {/* LEFT: Entry Form */}
        <div className="w-full xl:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">

            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" />
                {editingSlot ? "Edit Slot" : "Manage Schedule"}
              </h4>

              {/* View Mode Toggle */}
              <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
                <button
                  onClick={() => { setViewMode("class"); setTimetable([]); setSelectedId(""); }}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === "class" ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Class
                </button>
                <button
                  onClick={() => { setViewMode("teacher"); setTimetable([]); setSelectedId(""); }}
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === "teacher" ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Teacher
                </button>
              </div>
            </div>

            {msg.text && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-bold flex items-center gap-2 ${msg.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {msg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />} {msg.text}
              </div>
            )}

            {/* Selector Dropdown */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                {viewMode === "class" ? "Select Class" : "Select Teacher"}
              </label>
              <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold text-slate-700"
                onChange={handleSelectionChange}
                value={selectedId}
              >
                <option value="">-- Choose --</option>
                {viewMode === "class"
                  ? classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)
                  : teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)
                }
              </select>
            </div>

            {/* AI Button - Only for Class Mode currently as AI generates by class */}
            {viewMode === "class" && (
              <div className="mb-6">
                <button
                  onClick={async () => {
                    if (!form.classId) return setMsg({ text: "Select a class first!", type: "error" });
                    setLoading(true);
                    setMsg({ text: "✨ AI is designing the timetable...", type: "success" });
                    try {
                      const selectedClass = classes.find(c => c._id === form.classId)?.name;
                      const aiRes = await api.post("/api/ai/generate-timetable", {
                        teachers: teachers.map(t => ({ _id: t._id, name: t.name })),
                        className: selectedClass
                      });
                      const slots = aiRes.data.timetable || [];
                      let successCount = 0;
                      for (const slot of slots) {
                        try {
                          await api.post("/api/timetable", {
                            classId: form.classId, day: slot.day, timeSlot: slot.timeSlot, subject: slot.subject, teacher: slot.teacher
                          });
                          successCount++;
                        } catch (e) { console.warn("Conflict", e.message); }
                      }
                      setMsg({ text: `✨ Added ${successCount} slots.`, type: "success" });
                      fetchTimetable(form.classId);
                    } catch (err) { setMsg({ text: "AI Failed", type: "error" }); }
                    finally { setLoading(false); }
                  }}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? "Thinking..." : <><FaMagic /> Auto-Fill with AI</>}
                </button>
              </div>
            )}

            <hr className="mb-6 border-slate-100" />

            {/* FORM */}
            <form onSubmit={submit} className="space-y-4">
              {/* If in Teacher Mode, we need to select Class manually. If in Class Mode, Class is pre-selected */}
              {viewMode === "teacher" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Target Class</label>
                  <select name="classId" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" onChange={handleChange} value={form.classId} required>
                    <option value="">-- Select Class --</option>
                    {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                  </select>
                </div>
              )}

              {/* If in Class Mode, we need to select Teacher. If in Teacher Mode, Teacher is pre-selected */}
              {viewMode === "class" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Assign Teacher</label>
                  <select name="teacher" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" onChange={handleChange} value={form.teacher} required>
                    <option value="">-- Select Teacher --</option>
                    {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Day</label>
                  <select name="day" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" onChange={handleChange} value={form.day}>
                    {days.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Time Slot</label>
                  <input name="timeSlot" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="09:00 - 10:00" onChange={handleChange} value={form.timeSlot} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Subject</label>
                <input name="subject" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Mathematics" onChange={handleChange} value={form.subject} required />
              </div>

              <div className="flex gap-2 pt-2">
                <button disabled={loading} className={`flex-1 ${editingSlot ? "bg-amber-500 hover:bg-amber-600" : "bg-slate-900 hover:bg-slate-800"} text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2`}>
                  {loading ? "Saving..." : editingSlot ? <><FaPen /> Update Slot</> : <><FaPlus /> Add Slot</>}
                </button>
                {editingSlot && (
                  <button type="button" onClick={() => { setEditingSlot(null); setForm(prev => ({ ...prev, subject: "", timeSlot: "" })); }} className="px-4 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300">
                    <FaTimes />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Visual Schedule Grid */}
        <div className="w-full xl:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h5 className="font-bold text-slate-700 flex items-center gap-2">
                <FaClock className="text-blue-500" />
                {viewMode === "class"
                  ? `${classes.find(c => c._id === selectedId)?.name || 'Class'} Schedule`
                  : `${teachers.find(t => t._id === selectedId)?.name || 'Teacher'} Schedule`
                }
              </h5>
            </div>

            {!selectedId ? (
              <div className="text-center py-20 text-slate-400">
                <FaCalendarAlt size={48} className="mx-auto mb-4 opacity-20" />
                <p>Select a {viewMode === "class" ? "Class" : "Teacher"} to view their timetable.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {days.map(day => {
                  const daySlots = timetable
                    .filter(t => t.day === day)
                    .sort((a, b) => {
                      const timeA = parseInt(a.timeSlot.split(":")[0]);
                      const timeB = parseInt(b.timeSlot.split(":")[0]);
                      return timeA - timeB;
                    });

                  return (
                    <div key={day} className="flex flex-col gap-2">
                      <div className="bg-slate-100 p-2 rounded-lg text-center font-bold text-slate-600 uppercase text-xs tracking-wider border border-slate-200">
                        {day.substring(0, 3)}
                      </div>
                      <div className="flex flex-col gap-2 min-h-[200px] bg-slate-50/50 rounded-lg p-2 border border-dashed border-slate-200">
                        {daySlots.length === 0 ? (
                          <div className="text-center text-xs text-slate-300 py-4 italic">Free</div>
                        ) : (
                          daySlots.map(slot => (
                            <div key={slot._id} className={`p-3 rounded-lg border shadow-sm relative group bg-white hover:border-blue-300 transition-all ${editingSlot?._id === slot._id ? 'ring-2 ring-amber-400' : 'border-slate-100'}`}>
                              {/* Actions Overlay */}
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button onClick={() => initiateEdit(slot)} className="p-1 bg-amber-100 text-amber-600 rounded text-[10px] hover:bg-amber-200"><FaPen /></button>
                                <button onClick={() => handleDelete(slot._id)} className="p-1 bg-red-100 text-red-600 rounded text-[10px] hover:bg-red-200"><FaTrash /></button>
                              </div>

                              <div className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                                <FaClock size={10} /> {slot.timeSlot}
                              </div>
                              <div className="font-bold text-slate-800 text-sm leading-tight mb-1">{slot.subject}</div>
                              <div className="text-[10px] text-slate-500 font-semibold bg-slate-100 inline-block px-1.5 py-0.5 rounded">
                                {viewMode === "class" ? (slot.teacher?.name || "Unassigned") : (`${slot.classId?.name || "?"}-${slot.classId?.section || "?"}`)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default AdminTimetable;
