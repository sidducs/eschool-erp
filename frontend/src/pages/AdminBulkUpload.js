import { useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { FaCloudUploadAlt, FaFileCsv, FaInfoCircle } from "react-icons/fa";

function AdminBulkUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!file) {
      addToast("Please select a CSV file", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await api.post("/api/bulk-upload/students", formData);
      addToast("Students uploaded successfully", "success");
      setFile(null);
    } catch (error) {
      addToast(error.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">
          <FaCloudUploadAlt size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bulk Data Upload</h2>
          <p className="text-slate-500 text-sm">Import large datasets quickly via CSV files.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FaFileCsv className="text-emerald-500" />
              Student CSV Import
            </h3>

            <div 
              className={`border-2 border-dashed rounded-2xl p-10 mb-8 flex flex-col items-center justify-center transition-all
                        ${file ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}
              `}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setFile(e.dataTransfer.files[0]);
              }}
            >
              <FaCloudUploadAlt className={`text-4xl mb-4 ${file ? 'text-emerald-500' : 'text-slate-300'}`} />
              <p className="text-slate-600 font-medium mb-1">
                {file ? file.name : "Drag and drop your CSV here"}
              </p>
              <p className="text-slate-400 text-xs mb-4">Maximum file size: 5MB</p>
              
              <label className="cursor-pointer bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={submitHandler}
                disabled={!file || uploading}
                className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? "Processing..." : <><FaCloudUploadAlt /> Start Import</>}
              </button>
              <button
                onClick={() => setFile(null)}
                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 h-fit">
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
              <FaInfoCircle />
              Format Requirements
            </div>
            <ul className="space-y-3 text-sm text-indigo-900/70 font-medium">
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Column headers: <b>name, email, admissionId, fatherName, phoneNumber</b>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Required: name, email, admissionId (SRN).
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                <b>admissionId</b> must be unique for each student.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Default password: <b>student123</b> (can be overridden).
              </li>
            </ul>
            
            <button 
              onClick={() => {
                const csvContent = "name,email,admissionId,fatherName,phoneNumber\nJohn Doe,john@example.com,SRN001,Richard Doe,9876543210\nJane Smith,jane@example.com,SRN002,Robert Smith,9876543211";
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', 'student_bulk_upload_sample.csv');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="w-full mt-6 bg-white text-indigo-600 border border-indigo-200 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all">
              Download Sample CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminBulkUpload;
