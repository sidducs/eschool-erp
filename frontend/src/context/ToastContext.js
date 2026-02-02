import React, { createContext, useContext, useState, useCallback } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[300px] max-w-sm flex items-center p-4 rounded-xl shadow-2xl animate-bounceIn border-l-4 transition-all transform hover:scale-105
              ${toast.type === "success" ? "bg-white border-green-500 text-slate-800" : ""}
              ${toast.type === "error" || toast.type === "danger" ? "bg-white border-red-500 text-slate-800" : ""}
              ${toast.type === "warning" ? "bg-white border-amber-500 text-slate-800" : ""}
              ${toast.type === "info" ? "bg-white border-blue-500 text-slate-800" : ""}
            `}
          >
            <div className="mr-3 text-xl">
              {toast.type === "success" && <FaCheckCircle className="text-green-500" />}
              {(toast.type === "error" || toast.type === "danger") && <FaExclamationCircle className="text-red-500" />}
              {toast.type === "warning" && <FaExclamationCircle className="text-amber-500" />}
              {toast.type === "info" && <FaInfoCircle className="text-blue-500" />}
            </div>
            <div className="flex-1 text-sm font-bold">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-400 hover:text-slate-600"
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};