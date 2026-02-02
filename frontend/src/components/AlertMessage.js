import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

function AlertMessage({ type = "success", message, onClose }) {
  if (!message) return null;

  const styles = {
    success: "bg-green-50 text-green-800 border-green-200",
    danger: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    info: "bg-blue-50 text-blue-800 border-blue-200"
  };

  const icons = {
    success: <FaCheckCircle className="flex-shrink-0" />,
    danger: <FaExclamationCircle className="flex-shrink-0" />,
    warning: <FaExclamationCircle className="flex-shrink-0" />,
    info: <FaInfoCircle className="flex-shrink-0" />
  };

  return (
    <div className={`flex items-center p-4 mb-4 text-sm rounded-lg border ${styles[type] || styles.info} shadow-sm animate-fadeIn`} role="alert">
      <div className="mr-3 text-lg">
        {icons[type] || icons.info}
      </div>
      <div className="flex-1 font-medium">
        {message}
      </div>
      {onClose && (
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 opacity-50 hover:opacity-100 transition-opacity focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-50 focus:ring-blue-600"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <FaTimes />
        </button>
      )}
    </div>
  );
}

export default AlertMessage;
