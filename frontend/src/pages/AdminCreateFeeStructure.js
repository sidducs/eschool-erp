import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FaMoneyBillWave, FaPlusCircle, FaTrash, FaSave, FaArrowLeft } from "react-icons/fa";

import { useToast } from "../context/ToastContext";

function AdminCreateFeeStructure({ goBack }) {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [description, setDescription] = useState("");
  // New breakdown state
  const [breakdown, setBreakdown] = useState([
    { name: "Tuition Fee", amount: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/api/classes");
        setClasses(res.data);
      } catch (err) {
        console.error("Failed to fetch classes", err);
      }
    };
    fetchClasses();
  }, []);

  // Handle breakdown changes
  const handleBreakdownChange = (index, field, value) => {
    const newBreakdown = [...breakdown];
    newBreakdown[index][field] = field === "amount" ? parseFloat(value) || 0 : value;
    setBreakdown(newBreakdown);
  };

  const addComponent = () => {
    setBreakdown([...breakdown, { name: "", amount: 0 }]);
  };

  const removeComponent = (index) => {
    const newBreakdown = breakdown.filter((_, i) => i !== index);
    setBreakdown(newBreakdown);
  };

  const calculateTotal = () => {
    return breakdown.reduce((sum, item) => sum + item.amount, 0);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!classId) return addToast("Please select a class", "warning");

    setLoading(true);
    try {
      const totalFee = calculateTotal();

      await api.post("/api/fees", { // Fixed Route
        classId,
        description,
        totalFee,
        breakdown // Send the breakdown array
      });

      addToast("Fee Structure Created Successfully!", "success");
      setBreakdown([{ name: "Tuition Fee", amount: 0 }]);
      setDescription("");
      setClassId("");
    } catch (err) {
      addToast("Failed: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      {goBack && (
        <button
          onClick={goBack}
          className="mb-4 flex items-center text-slate-500 hover:text-slate-800 font-semibold transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back to Fees
        </button>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 p-3 rounded-test text-white shadow-lg shadow-blue-500/20">
          <FaMoneyBillWave size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Create Fee Structure</h2>
          <p className="text-slate-500 text-sm">Define fee components for academic classes.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          <form onSubmit={submitHandler} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Academic Class</label>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} - {c.section} ({c.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description / Term</label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                  placeholder="e.g. Annual Fees 2024-25"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-700 text-lg">Fee Components</h4>
                <button
                  type="button"
                  onClick={addComponent}
                  className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1"
                >
                  <FaPlusCircle /> Add Component
                </button>
              </div>

              <div className="space-y-3">
                {breakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 animate-fadeIn">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Component Name (e.g. Bus Fee)"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                        value={item.name}
                        onChange={(e) => handleBreakdownChange(index, "name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-40 relative">
                      <span className="absolute left-3 top-3 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full pl-8 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-700"
                        value={item.amount}
                        onChange={(e) => handleBreakdownChange(index, "amount", e.target.value)}
                        required
                        min="0"
                      />
                    </div>
                    {breakdown.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeComponent(index)}
                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-xl flex justify-between items-center mt-6">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Annual Fee</p>
                <h3 className="text-3xl font-bold">₹ {calculateTotal().toLocaleString()}</h3>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
              >
                {loading ? "Creating..." : <><FaSave /> Save Structure</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminCreateFeeStructure;
