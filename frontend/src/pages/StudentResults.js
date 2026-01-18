import { useEffect, useState } from "react";
import api from "../services/api";
import { FaClipboardList, FaChartPie } from "react-icons/fa";

function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get("/api/results/student");
        setResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const styles = {
    header: { borderBottom: "2px solid #f1f5f9", paddingBottom: "15px", marginBottom: "20px" },
    tableHeader: { backgroundColor: "#f8fafc", color: "#64748b", fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase" },
    progressBarBg: { height: "6px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "8px" }
  };

  // Helper for color based on percentage
  const getColor = (pct) => {
    if (pct >= 90) return "success";
    if (pct >= 75) return "primary";
    if (pct >= 60) return "info";
    if (pct >= 40) return "warning";
    return "danger";
  };

  if (loading) return <div className="p-5 text-center text-muted">Loading results...</div>;

  return (
    <div className="container-fluid p-0">
      
      {/* HEADER */}
      <div style={styles.header} className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded me-3"><FaClipboardList size={24} /></div>
            <div>
                <h5 className="fw-bold text-dark m-0">My Results</h5>
                <small className="text-muted">Academic Performance</small>
            </div>
        </div>
        <div className="d-none d-sm-block text-end">
            <span className="badge bg-light text-dark border px-3 py-2">
                <FaChartPie className="me-2 text-primary"/> Total Exams: {results.length}
            </span>
        </div>
      </div>

      {/* TABLE */}
      {results.length === 0 ? (
        <div className="text-center py-5 bg-light rounded border border-dashed">
           <p className="text-muted mb-0">No results found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={styles.tableHeader}>
              <tr>
                <th className="ps-4 py-3">Exam Name</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Percentage</th>
                <th className="text-end pe-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, index) => {
                // FIXED: Use flat keys matching your backend controller
                const color = getColor(r.percentage);
                
                return (
                  <tr key={index}>
                    <td className="ps-4 fw-bold text-dark">{r.examName || "Exam"}</td>
                    <td className="text-secondary">{r.subject || "General"}</td>
                    
                    {/* Marks */}
                    <td>
                      <span className="fw-bold text-dark">{r.marksObtained}</span> 
                      <span className="text-muted small"> / {r.totalMarks}</span>
                    </td>

                    {/* Progress Bar */}
                    <td style={{minWidth: '120px'}}>
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="small fw-bold">{r.percentage}%</span>
                        </div>
                        <div style={styles.progressBarBg}>
                            <div style={{
                                    height: "100%", 
                                    width: `${r.percentage}%`, 
                                    backgroundColor: `var(--bs-${color})`, 
                                    borderRadius: "10px"
                                }} 
                            />
                        </div>
                    </td>

                    {/* Status */}
                    <td className="text-end pe-4">
                      <span className={`badge bg-${r.status === "Pass" ? "success" : "danger"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StudentResults;