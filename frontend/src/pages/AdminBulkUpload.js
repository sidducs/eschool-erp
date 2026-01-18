import { useState } from "react";
import api from "../services/api";

function AdminBulkUpload() {
  const [file, setFile] = useState(null);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/api/bulk-upload/students", formData);
      alert("Students uploaded successfully");
      setFile(null);
    } catch (error) {
      alert("Upload failed");
    }
  };

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">Admin / Students / Bulk Upload</div>

      <h3 className="fw-bold mb-4">Bulk Student Upload</h3>

      <div
        className="bg-white p-4 shadow-sm"
        style={{ maxWidth: "600px", borderRadius: "8px" }}
      >
        <p className="text-muted mb-3">
          Upload a CSV file to add multiple students at once.  
          Ensure the file follows the required format.
        </p>

        <form onSubmit={submitHandler}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Select CSV File</label>
            <input
              type="file"
              className="form-control"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              Upload Students
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setFile(null)}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminBulkUpload;
