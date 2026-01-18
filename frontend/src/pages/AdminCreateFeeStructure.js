import { useEffect, useState } from "react";
import api from "../services/api";

function AdminCreateFeeStructure() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [totalFee, setTotalFee] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/api/classes");
        setClasses(res.data);
      } catch (error) {
        alert("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!classId || !totalFee) {
      alert("Please select class and enter fee");
      return;
    }

    try {
      await api.post("/api/fees", {
        classId,
        totalFee: Number(totalFee),
        description,
      });

      alert("Fee structure created successfully");
      setClassId("");
      setTotalFee("");
      setDescription("");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating fee structure");
    }
  };

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">Admin / Fees / Create</div>

      <h3 className="fw-bold mb-4">Create Fee Structure</h3>

      <div
        className="bg-white p-4 shadow-sm"
        style={{ borderRadius: "8px", maxWidth: "560px" }}
      >
        <form onSubmit={submitHandler}>
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
                  {c.name} {c.section}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Total Fee</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 25000"
              value={totalFee}
              onChange={(e) => setTotalFee(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Any notes about this fee structure"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-dark">
              Save Fee Structure
            </button>
            <button
              type="reset"
              className="btn btn-outline-secondary"
              onClick={() => {
                setClassId("");
                setTotalFee("");
                setDescription("");
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

export default AdminCreateFeeStructure;
