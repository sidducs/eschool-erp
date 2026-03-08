import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useReactToPrint } from "react-to-print";
import { FaPrint, FaArrowLeft, FaSchool, FaBuilding, FaPhone, FaGlobe } from "react-icons/fa";
import Loader from "../components/Loader";

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
        website: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                try {
                    const settingsRes = await api.get("/api/settings");
                    if (settingsRes.data) setSchoolSettings(settingsRes.data);
                } catch { }

                try {
                    const myFeeRes = await api.get("/api/fees/my-fee");
                    if (myFeeRes.data && (myFeeRes.data._id === id || !id)) {
                        setFeeData(myFeeRes.data);
                        setLoading(false);
                        return;
                    }
                } catch { }

                const allFeesRes = await api.get("/api/fees/student-fees");
                const found = allFeesRes.data.find((f) => f._id === id);

                if (found) {
                    setFeeData(found);
                } else {
                    setError("Receipt not found");
                }
            } catch {
                setError("Unable to load receipt details.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Receipt_${feeData?.studentId?.admissionId || id}`,
        pageStyle: `
      @page { size: A4; margin: 15mm; }
      body { -webkit-print-color-adjust: exact; }
    `,
    });

    if (loading) return <Loader text="Generating Receipt..." />;

    if (error || !feeData)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-slate-500">
                <p className="text-xl font-bold mb-2">Notice</p>
                <p>{error || "Receipt data unavailable"}</p>
            </div>
        );

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">

            {/* HEADER */}
            <div className="bg-white shadow-sm border-b border-slate-200 p-4 sticky top-0 z-50 flex justify-between items-center no-print">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="text-slate-600 hover:text-slate-900 font-bold flex items-center"
                    >
                        <FaArrowLeft className="mr-2" /> Back
                    </button>
                    <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
                        Fee Receipt Preview
                    </h1>
                </div>

                <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <FaPrint /> Print / Download
                </button>
            </div>

            {/* RECEIPT */}
            <div className="flex-1 overflow-y-auto p-6 flex justify-center">

                <div
                    ref={componentRef}
                    className="w-[210mm] bg-white p-[20mm] shadow-lg text-slate-900"
                >

                    {/* SCHOOL HEADER */}
                    <div className="border-b pb-6 mb-6 flex justify-between">
                        <div className="flex items-center gap-4">
                            <FaSchool className="text-4xl" />
                            <div>
                                <h1 className="text-xl font-bold uppercase">
                                    {schoolSettings.schoolName || "School Name"}
                                </h1>

                                <p className="text-sm flex items-center">
                                    <FaBuilding className="mr-2" /> {schoolSettings.address}
                                </p>

                                <p className="text-sm flex items-center">
                                    <FaPhone className="mr-2" /> {schoolSettings.phone}
                                    <span className="mx-2">•</span>
                                    <FaGlobe className="mr-2" /> {schoolSettings.website}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-mono font-bold">
                                #{feeData._id.slice(-6).toUpperCase()}
                            </p>
                            <p className="text-xs">
                                {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* STUDENT INFO */}
                    <div className="bg-slate-50 p-5 rounded-lg border mb-6 grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs text-slate-500">Student Name</p>
                            <p className="font-bold">{feeData.studentId?.name}</p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Admission No</p>
                            <p className="font-mono font-bold">
                                {feeData.studentId?.admissionId || "N/A"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Class</p>
                            <p>
                                {feeData.classId?.name} - {feeData.classId?.section}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Status</p>
                            <span className={`font-bold ${feeData.status === "PAID" ? "text-green-600" : "text-amber-600"
                                }`}>
                                {feeData.status}
                            </span>
                        </div>
                    </div>

                    {/* FEE TABLE */}
                    <table className="w-full text-sm mb-10">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 text-left">Fee Description</th>
                                <th className="py-2 text-right">Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {feeData.breakdown && feeData.breakdown.length > 0 ? (
                                feeData.breakdown.map((item, idx) => (
                                    <tr key={idx} className="border-b border-slate-100">
                                        <td className="py-3">{item.name}</td>
                                        <td className="text-right">₹{item.amount?.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-3">Academic Fees</td>
                                    <td className="text-right">
                                        ₹{feeData.totalFee?.toLocaleString()}
                                    </td>
                                </tr>
                            )}
                        </tbody>

                        <tfoot>
                            <tr className="border-t">
                                <td className="py-3 font-bold">Total Payable</td>
                                <td className="text-right font-bold">
                                    ₹{feeData.totalFee?.toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* BALANCE */}
                    <div className="flex justify-end mb-10">
                        <div className="w-56 bg-slate-50 p-4 rounded border">

                            <div className="flex justify-between mb-2">
                                <span>Paid Amount</span>
                                <span className="font-bold text-green-600">
                                    ₹{feeData.paidAmount?.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between border-t pt-2">
                                <span className="font-bold">Balance</span>
                                <span className={`font-bold ${feeData.totalFee - feeData.paidAmount > 0
                                        ? "text-red-500"
                                        : "text-green-600"
                                    }`}>
                                    ₹{(feeData.totalFee - feeData.paidAmount)?.toLocaleString()}
                                </span>
                            </div>

                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="text-center text-xs text-slate-400 border-t pt-6">
                        <p>This is a system generated receipt</p>
                        <p>No signature required</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FeeReceiptView;