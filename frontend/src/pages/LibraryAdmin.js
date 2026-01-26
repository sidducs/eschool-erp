import React, { useEffect, useState } from 'react';
import api from "../services/api";

const LibraryAdmin = () => {
    const [transactions, setTransactions] = useState([]);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/api/library/transactions');
            setTransactions(res.data);
        } catch (err) { console.error("Fetch error", err); }
    };

    useEffect(() => { fetchTransactions(); }, []);

    const handleReturn = async (transactionId, bookId) => {
        if (!window.confirm("Mark as returned?")) return;
        try {
            await api.put(`/api/library/return/${transactionId}`, { bookId });
            alert("Returned!");
            fetchTransactions();
        } catch (err) { alert("Error returning book"); }
    };
    

    return (
        <div className="container mt-3">
            <h3>🛡️ Library Management</h3>
            <table className="table table-hover border mt-3">
                <thead className="table-dark">
                    <tr>
                        <th>Book</th>
                        <th>Student</th>
                        <th>Fine</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tr) => (
                        <tr key={tr._id}>
                            <td>{tr.bookId?.title || "Unknown Book"}</td>
                            <td>{tr.studentId?.name || "Unknown Student"}</td>
                            <td className="text-danger">₹{tr.fine}</td>
                            <td><span className={`badge ${tr.status === 'Issued' ? 'bg-warning' : 'bg-success'}`}>{tr.status}</span></td>
                            <td>
                                {tr.status === 'Issued' && (
                                    <button className="btn btn-sm btn-success" onClick={() => handleReturn(tr._id, tr.bookId?._id)}>Return</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default LibraryAdmin;