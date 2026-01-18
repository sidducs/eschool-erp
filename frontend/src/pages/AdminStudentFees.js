import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";

function AdminStudentFees() {
  const [fees, setFees] = useState([]);
  const [paymentInputs, setPaymentInputs] = useState({});
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const navigate = useNavigate();

  const fetchFees = async () => {
    try {
      const res = await api.get("/api/fees/student-fees");
      setFees(res.data);
    } catch {
      alert("Failed to load student fees");
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const updatePayment = async () => {
    if (!selectedStudentId) return;

    try {
      await api.put("/api/fees/pay", {
        studentId: selectedStudentId,
        paidAmount: paymentInputs[selectedStudentId],
      });
      
      setShowPayConfirm(false);
      setSelectedStudentId(null);
      fetchFees();
    } catch {
      alert("Failed to update payment");
    }
  };

  const downloadReceipt = async (studentId) => {
    try {
      const res = await api.get(`/api/fees/receipt/${studentId}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "fee-receipt.pdf";
      link.click();
    } catch {
      alert("Failed to download receipt");
    }
  };

  return (
    <>
    
      <div className="container mt-4">
        <h3>Student Fees</h3>

        {fees.length === 0 ? (
          <EmptyState
            title="No Fee Records"
            description="No fees have been assigned to students yet."
            actionText="Assign Fee"
            onAction={() => navigate("/admin/assign-fee")}
          />
        ) : (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Total Fee</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {fees.map((f) => (
                <tr key={f._id}>
                  <td>{f.studentId?.name}</td>
                  <td>
                    {f.classId?.name} {f.classId?.section}
                  </td>
                  <td>Rs:{f.totalFee}</td>
                  <td>Rs:{f.paidAmount}</td>
                  <td>
                    <strong
                      style={{
                        color: f.status === "PAID" ? "green" : "red",
                      }}
                    >
                      {f.status}
                    </strong>
                  </td>

                  <td>
                    <input
                      type="number"
                      className="form-control mb-2"
                      placeholder="Enter paid amount"
                      value={paymentInputs[f.studentId._id] || ""}
                      onChange={(e) =>
                        setPaymentInputs({
                          ...paymentInputs,
                          [f.studentId._id]: e.target.value,
                        })
                      }
                    />

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => {
                          setSelectedStudentId(f.studentId._id);
                          setShowPayConfirm(true);
                        }}
                      >
                        Update Payment
                      </button>

                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => downloadReceipt(f.studentId._id)}
                      >
                        Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        show={showPayConfirm}
        title="Confirm Payment"
        message="Are you sure you want to update the payment?"
        confirmText="Update"
        onCancel={() => {
          setShowPayConfirm(false);
          setSelectedStudentId(null);
        }}
        onConfirm={updatePayment}
      />
    </>
  );
}

export default AdminStudentFees;
