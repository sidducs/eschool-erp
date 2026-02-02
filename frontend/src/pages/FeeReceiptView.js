import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useReactToPrint } from 'react-to-print';
import { FaPrint, FaArrowLeft, FaSchool, FaBuilding, FaPhone, FaGlobe } from 'react-icons/fa';
import Loader from '../components/Loader';

const FeeReceiptView = () => {
    const { id } = useParams();
    const [feeData, setFeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const componentRef = useRef();

    const [schoolSettings, setSchoolSettings] = useState({
        schoolName: "",
        address: "",
        phone: "",
        website: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch School Settings
                try {
                    const settingsRes = await api.get('/api/settings');
                    console.log("Fetched Settings:", settingsRes.data);
                    if (settingsRes.data) setSchoolSettings(settingsRes.data);
                } catch (err) {
                    console.warn("Failed to load school settings", err);
                }

                // 2. Fetch Fee Data (Smart Strategy)
                // Attempt 1: Try getting 'my-fee' (Student View)
                try {
                    const myFeeRes = await api.get("/api/fees/my-fee");
                    // Check if the returned fee matches the requested ID or if it's the valid current fee
                    if (myFeeRes.data && (myFeeRes.data._id === id || !id)) {
                        setFeeData(myFeeRes.data);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    // Ignore 403/404 here, proceed to admin strategy
                }

                // Attempt 2: Try getting all fees (Admin View)
                const allFeesRes = await api.get("/api/fees/student-fees");
                const found = allFeesRes.data.find(f => f._id === id);

                if (found) {
                    setFeeData(found);
                } else {
                    setError("Receipt not found");
                }

            } catch (err) {
                console.error("Error loading receipt:", err);
                setError("Unable to load receipt details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Receipt_${feeData?.studentId?.admissionId || id}`,
    });

    if (loading) return <Loader text="Generating Receipt..." />;
    if (error || !feeData) return (
        <div className="flex flex-col items-center justify-center min-h-screen text-slate-500">
            <p className="text-xl font-bold mb-2">Notice</p>
            <p>{error || "Receipt data unavailable"}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Action Header */}
            <div className="bg-white shadow-sm border-b border-slate-200 p-4 sticky top-0 z-50 flex justify-between items-center no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.close()} className="text-slate-600 hover:text-slate-900 font-bold flex items-center transition-colors">
                        <FaArrowLeft className="mr-2" /> Close
                    </button>
                    <h1 className="text-lg font-bold text-slate-800 hidden sm:block">Fee Receipt Preview</h1>
                </div>
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                    <FaPrint /> Print / Download
                </button>
            </div>

            {/* Receipt Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start">

                <style>{`
                    @media print {
                        @page { size: A4; margin: 0; }
                        body { background: white; -webkit-print-color-adjust: exact; }
                        .no-print { display: none !important; }
                        .print-container { 
                            box-shadow: none !important; 
                            border: none !important;
                            width: 100% !important; 
                            max-width: 100% !important;
                            margin: 0 !important;
                            padding: 10mm 15mm !important;
                            min-h: 0 !important;
                        }
                    }
                `}</style>

                <div ref={componentRef} className="print-container w-[210mm] bg-white p-[15mm] shadow-lg text-slate-900 mx-auto relative">

                    {/* Header */}
                    <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <FaSchool className="text-5xl text-slate-900" />
                            <div>
                                <h1 className="text-2xl font-serif font-bold uppercase tracking-widest text-slate-900 leading-tight">{schoolSettings.schoolName || "School Name"}</h1>
                                <div className="text-xs text-slate-500 font-medium space-y-1 mt-2">
                                    <p className="flex items-center"><FaBuilding className="mr-2 opacity-70" /> {schoolSettings.address}</p>
                                    <p className="flex items-center"><FaPhone className="mr-2 opacity-70" /> {schoolSettings.phone} <span className="mx-2">•</span> <FaGlobe className="mr-2 opacity-70" /> {schoolSettings.website}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                                Official Receipt
                            </div>
                            <p className="text-sm font-mono font-bold text-slate-700">#{feeData._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Student Info Grid */}
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 mb-8">
                        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Student Name</p>
                                <p className="font-bold text-lg text-slate-900">{feeData.studentId?.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Admission No / SRN</p>
                                <p className="font-mono font-bold text-lg text-slate-900">{feeData.studentId?.admissionId || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Class & Section</p>
                                <p className="font-semibold text-slate-800">{feeData.classId?.name} - {feeData.classId?.section}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Payment Status</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${feeData.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                    {feeData.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Fee Table */}
                    <div className="mb-10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-slate-900">
                                    <th className="py-3 text-left font-bold uppercase text-xs tracking-wider text-slate-600">Fee Description</th>
                                    <th className="py-3 text-right font-bold uppercase text-xs tracking-wider text-slate-600">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-4 font-medium text-slate-800">Academic & Tuition Fees</td>
                                    <td className="py-4 text-right font-mono text-slate-700">₹{feeData.totalFee?.toLocaleString()}</td>
                                </tr>
                                {/* Add more rows here if detail exists */}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-slate-900">
                                    <td className="py-4 font-bold text-slate-900 pl-2">Total Payable</td>
                                    <td className="py-4 text-right font-bold font-mono text-xl text-slate-900">₹{feeData.totalFee?.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Balance Section */}
                    <div className="flex justify-end mb-16">
                        <div className="w-56 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-slate-500">Paid Amount</span>
                                <span className="font-mono font-bold text-green-600">₹{feeData.paidAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                                <span className="text-xs font-bold uppercase text-slate-700">Balance Due</span>
                                <span className={`font-mono font-bold text-lg ${feeData.totalFee - feeData.paidAmount > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                                    ₹{(feeData.totalFee - feeData.paidAmount)?.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-8 border-t border-slate-100 text-center">
                        <p className="font-serif italic text-slate-400 text-sm mb-2">"Empowering the next generation of leaders."</p>
                        <div className="flex justify-center items-center gap-2 text-[10px] text-slate-300 uppercase tracking-widest">
                            <span>This is system generated Receipt </span>
                            <span>•</span>
                            <span>Doesn't require signature </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeeReceiptView;
