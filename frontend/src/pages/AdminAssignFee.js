import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader";

function AdminAssignFee() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search State

  // Fee Structure States
  const [feeStructure, setFeeStructure] = useState(null);
  const [customBreakdown, setCustomBreakdown] = useState([]);

  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState("Tuition Fee"); // Used as description if structure exists

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass(selectedClass);
      fetchFeeStructure(selectedClass);
    } else {
      setStudents([]);
      setSelectedStudents([]);
      setFeeStructure(null);
      setCustomBreakdown([]);
      setAmount("");
    }
    // eslint-disable-next-line
  }, [selectedClass]);

  // Auto-calculate amount when breakdown changes
  useEffect(() => {
    if (feeStructure && customBreakdown.length > 0) {
      const total = customBreakdown.reduce((sum, item) => sum + Number(item.amount), 0);
      setAmount(total);
      setType(feeStructure.description || "Term Fee");
    }
  }, [customBreakdown, feeStructure]);

  const fetchFeeStructure = async (classId) => {
    try {
      const res = await api.get(`/api/fees/structure/${classId}`);
      setFeeStructure(res.data);
      setCustomBreakdown(res.data.breakdown || []);
    } catch (err) {
      setFeeStructure(null);
      setCustomBreakdown([]);
      setAmount("");
      // Don't show error toast here, as some classes might not have structure (which is fine, manual mode)
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get("/api/classes");
      setClasses(res.data);
    } catch (err) {
      addToast("Failed to fetch classes", "error");
    }
  };

  const fetchStudentsByClass = async (classId) => {
    setLoading(true);
    try {
      // Use specific student endpoint which populates classId
      const res = await api.get(`/api/admin/students`);

      const classStudents = res.data.filter(u => {
        // robust check: handle both populated object and direct ID (just in case)
        const studentClassId = u.classId?._id || u.classId;
        return studentClassId === classId;
      });

      setStudents(classStudents);
      setSelectedStudents([]); // Reset selection
    } catch (err) {
      addToast("Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map(s => s._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(sid => sid !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      addToast("Select at least one student", "warning");
      return;
    }
    if (!amount || !dueDate) {
      addToast("Please fill in fee details", "warning");
      return;
    }

    setSubmitting(true);
    let successCount = 0;

    // Prepare Breakdown
    let finalBreakdown = customBreakdown;

    // If no structure/breakdown selected but amount exists (Manual Mode), create ad-hoc breakdown
    if ((!finalBreakdown || finalBreakdown.length === 0) && amount) {
      finalBreakdown = [{
        name: type || "Adhoc Fee",
        amount: Number(amount)
      }];
    }

    // Process in batches or parallel
    try {
      const promises = selectedStudents.map(studentId =>
        api.post("/api/fees/assign", {
          studentId,
          amount,
          dueDate,
          description: type,
          breakdown: finalBreakdown, // Send the constructed breakdown
          feeStructureId: feeStructure?._id || null
        }).then(() => {
          successCount++;
        }).catch(err => {
          console.error(`Failed for ${studentId}`, err);
        })
      );

      await Promise.all(promises);

      if (successCount > 0) {
        addToast(`Successfully assigned fee to ${successCount} students`, "success");
        // Reset form
        setAmount("");
        setDueDate("");
        setSelectedStudents([]);
        setSelectedClass("");
      } else {
        addToast("Failed to assign fees. Check logs.", "error");
      }

    } catch (error) {
      addToast("Critical error during assignment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Assign Fees (Bulk)</h1>
        <div className="text-sm text-slate-500">Admin / Fees / Assign</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Setup */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-4 text-slate-700">1. Fee Details</h3>

            {/* Class Selection First to trigger Structure Fetch */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-600 mb-1">Select Class</label>
              <select
                className="w-full p-3 border rounded-xl bg-slate-50 font-semibold"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                ))}
              </select>
            </div>

            {selectedClass && (
              <div className="space-y-4 animate-fadeIn">

                {/* Structure Details or Manual Override */}
                {!feeStructure ? (
                  <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm mb-4">
                    No Fee Structure found for this class. <br />
                    <span className="font-bold">Enter manually below.</span>
                  </div>
                ) : (
                  <div className="mb-4">
                    <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wide mb-2">Fee Structure</h4>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-400 mb-1">{feeStructure.description}</div>
                      {feeStructure.breakdown.map((item, idx) => (
                        <label key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 cursor-pointer hover:border-blue-300 transition-colors">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={customBreakdown.some(b => b.name === item.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCustomBreakdown([...customBreakdown, item]);
                                } else {
                                  setCustomBreakdown(customBreakdown.filter(b => b.name !== item.name));
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-800">₹{item.amount}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual / Ad-hoc Fields */}
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Total Amount (Rs.)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg font-bold text-lg bg-white"
                    placeholder="0.00"
                    value={amount} // Now controlled by effect if structure exists
                    onChange={(e) => setAmount(e.target.value)}
                    readOnly={!!feeStructure && customBreakdown.length > 0} // Read-only if using structure
                  />
                  {!!feeStructure && <p className="text-xs text-slate-400 mt-1">Calculated from selected components</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                {!feeStructure && (
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Fee Description</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g. Tuition Fee"
                      value={type} // Using 'type' as description for manual
                      onChange={(e) => setType(e.target.value)}
                    />
                  </div>
                )}

              </div>
            )}
          </div>

          <button
            onClick={handleAssign}
            disabled={submitting || selectedStudents.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 ${submitting || selectedStudents.length === 0
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30"
              }`}
          >
            {submitting ? "Processing..." : `Assign Fee to ${selectedStudents.length} Students`}
          </button>
        </div>

        {/* Right Col: Student List */}
        {/* Right Col: Student List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h6 className="font-bold text-slate-700">Select Students</h6>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                onChange={handleSelectAll}
                checked={students.length > 0 && selectedStudents.length === students.length}
                disabled={students.length === 0}
              />
              <span className="text-sm font-semibold text-slate-600">Select All</span>
            </label>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Search Bar */}
            <div className="px-6 py-2 bg-white sticky top-0 z-20 border-b border-slate-100">
              <input
                type="text"
                placeholder="Search student by name..."
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <Loader text="Loading Students..." />
            ) : !selectedClass ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>Select a class to view students.</p>
              </div>
            ) : students.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>No students found in this class.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 sticky top-12 z-10">
                  <tr>
                    <th className="px-6 py-3 border-b border-slate-100 w-16"></th>
                    <th className="px-6 py-3 border-b border-slate-100 text-slate-500 font-semibold">Name</th>
                    <th className="px-6 py-3 border-b border-slate-100 text-slate-500 font-semibold">Admission ID</th>
                    <th className="px-6 py-3 border-b border-slate-100 text-slate-500 font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
                    <tr
                      key={student._id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedStudents.includes(student._id) ? "bg-indigo-50/50" : ""}`}
                      onClick={(e) => {
                        // Toggle if clicking the row (but not directly on checkbox to avoid double toggle)
                        if (e.target.type !== 'checkbox') {
                          handleSelectStudent(student._id);
                        }
                      }}
                    >
                      <td className="px-6 py-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleSelectStudent(student._id)}
                        />
                      </td>
                      <td className="px-6 py-3 font-bold text-slate-700">{student.name}</td>
                      <td className="px-6 py-3 font-mono text-slate-500">{student.admissionId || "N/A"}</td>
                      <td className="px-6 py-3 text-slate-500">{student.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between">
            <span>Total Students: {students.length}</span>
            <span className="font-bold text-indigo-600">Selected: {selectedStudents.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAssignFee;
