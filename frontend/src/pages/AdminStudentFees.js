import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../context/ToastContext";

function AdminStudentFees() {
  const [fees, setFees] = useState([]);
  const [paymentInputs, setPaymentInputs] = useState({});
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const { addToast } = useToast();

  const navigate = useNavigate();

  const fetchFees = async () => {
    try {
      const res = await api.get("/api/fees/student-fees");
      setFees(res.data);
    } catch {
      addToast("Failed to load student fees", "error");
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const updatePayment = async () => {
    if (!selectedStudentId) return; // This is now Fee ID

    try {
      await api.put("/api/fees/pay", {
        feeId: selectedStudentId, // Sending Fee ID
        paidAmount: paymentInputs[selectedStudentId], // Keyed by Fee ID
      });

      addToast("Payment updated successfully", "success");
      setShowPayConfirm(false);
      setSelectedStudentId(null);
      fetchFees();
    } catch {
      addToast("Failed to update payment", "error");
    }
  };

  const downloadReceipt = async (studentId) => {
    try {
      const res = await api.get(`/api/fees/receipt/${studentId}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank"); // Open in new tab for preview
    } catch {
      addToast("Failed to download receipt", "error");
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
        <div className="table-responsive">
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
                      value={paymentInputs[f._id] || ""}
                      onChange={(e) =>
                        setPaymentInputs({
                          ...paymentInputs,
                          [f._id]: e.target.value,
                          })
                        }
                      />

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => {
                          setSelectedStudentId(f._id); // Storing Fee ID now
                          setShowPayConfirm(true);
                        }}
                      >
                        Update Payment
                      </button>

                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => downloadReceipt(f._id)} // Passing Fee ID
                      >
                        Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
