import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                            <FaExclamationTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    </div>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        {message}
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className={`px-6 py-2 text-white font-bold rounded-lg shadow-md transition-transform transform active:scale-95 ${isDanger
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
