import React, { useEffect, useState } from 'react';
import api from "../services/api";
import { FaShieldAlt, FaUndo } from "react-icons/fa";

const LibraryAdmin = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/api/library/transactions');
            setTransactions(res.data);
        } catch (err) { console.error("Fetch error", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTransactions(); }, []);

    const handleReturn = async (transactionId, bookId) => {
        if (!window.confirm("Mark as returned?")) return;
        try {
            await api.put(`/api/library/return/${transactionId}`, { bookId });
            fetchTransactions();
        } catch (err) { alert("Error returning book"); }
    };

    if (loading) return <div className="text-center py-6 text-slate-500">Loading transactions...</div>;

    return (
        <div className="animate-fadeIn">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FaShieldAlt className="text-purple-600" /> Library Transactions
            </h3>

            {transactions.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-500 text-sm">No active transactions found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-slate-50 text-xs uppercase font-semibold">
                                    <th className="px-6 py-4">Book Title</th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Fine</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.map((tr) => (
                                    <tr key={tr._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{tr.bookId?.title || "Unknown Book"}</td>
                                        <td className="px-6 py-4 text-slate-600">{tr.studentId?.name || "Unknown Student"}</td>
                                        <td className="px-6 py-4 font-bold text-red-500">
                                            {tr.fine > 0 ? `₹${tr.fine}` : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${tr.status === 'Issued'
                                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                : 'bg-green-100 text-green-800 border border-green-200'
                                                }`}>
                                                {tr.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tr.status === 'Issued' && (
                                                <button
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                                    onClick={() => handleReturn(tr._id, tr.bookId?._id)}
                                                >
                                                    <FaUndo /> Return
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
export default LibraryAdmin;