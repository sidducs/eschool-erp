// import { createContext, useState } from "react";

// export const ToastContext = createContext();

// export function ToastProvider({ children }) {
//   const [toast, setToast] = useState({
//     show: false,
//     message: "",
//     type: "success", // success | danger | warning | info
//   });

//   const showToast = (message, type = "success") => {
//     setToast({ show: true, message, type });

//     setTimeout(() => {
//       setToast({ ...toast, show: false });
//     }, 3000);
//   };

//   return (
//     <ToastContext.Provider value={{ showToast }}>
//       {children}

//       {toast.show && (
//         <div
//           className={`toast align-items-center text-white bg-${toast.type} show position-fixed bottom-0 end-0 m-3`}
//           role="alert"
//           style={{ zIndex: 9999 }}
//         >
//           <div className="d-flex">
//             <div className="toast-body">{toast.message}</div>
//           </div>
//         </div>
//       )}
//     </ToastContext.Provider>
//   );
// }

import { createContext, useState, useCallback } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- STYLES ---
  const styles = {
    container: {
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    toast: (type) => ({
      minWidth: "320px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderLeft: `5px solid ${
        type === "success" ? "#10b981" : 
        type === "danger" ? "#ef4444" : 
        type === "warning" ? "#f59e0b" : "#3b82f6"
      }`,
      animation: "slideIn 0.3s ease-out forwards",
      fontFamily: "'Inter', sans-serif",
    }),
    content: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    message: {
      fontSize: "0.95rem",
      color: "#1f2937",
      fontWeight: "500",
      margin: 0,
    },
    closeBtn: {
      background: "transparent",
      border: "none",
      color: "#9ca3af",
      cursor: "pointer",
      padding: "4px",
      display: "flex",
      alignItems: "center",
    }
  };

  // Icon Helper
  const getIcon = (type) => {
    switch(type) {
        case "success": return <FaCheckCircle color="#10b981" size={20} />;
        case "danger": return <FaExclamationCircle color="#ef4444" size={20} />;
        case "warning": return <FaExclamationTriangle color="#f59e0b" size={20} />;
        default: return <FaInfoCircle color="#3b82f6" size={20} />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div style={styles.container}>
        {toasts.map((toast) => (
          <div key={toast.id} style={styles.toast(toast.type)} className="toast-item">
            <div style={styles.content}>
               {getIcon(toast.type)}
               <p style={styles.message}>{toast.message}</p>
            </div>
            <button style={styles.closeBtn} onClick={() => removeToast(toast.id)}>
              <FaTimes />
            </button>
          </div>
        ))}
      </div>

      {/* Inline Animation Style */}
      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}
      </style>
    </ToastContext.Provider>
  );
};