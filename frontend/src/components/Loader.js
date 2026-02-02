import { FaSpinner } from "react-icons/fa";

function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col justify-center items-center h-48 w-full">
      <FaSpinner className="animate-spin text-blue-600 text-3xl mb-3" />
      <span className="text-slate-500 font-medium text-sm animate-pulse">{text}</span>
    </div>
  );
}

export default Loader;
