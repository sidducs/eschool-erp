import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FaPrint, FaSchool, FaMedal } from 'react-icons/fa';
import api from "../services/api";

const StudentReportCard = ({ student, results, onBack }) => {
    const componentRef = useRef(null);
    const [schoolSettings, setSchoolSettings] = useState({
        schoolName: "ESchool Academy",
        address: "123 Education Lane, Knowledge City",
        phone: "",
        website: ""
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/api/settings');
                if (data) setSchoolSettings(data);
            } catch (err) {
                console.warn("Failed to fetch school settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `ReportCard_${student.name || "Student"}`,
        pageStyle: `
            @page { size: A4; margin: 15mm; }
            body { -webkit-print-color-adjust: exact; }
        `
    });

    const calculateOverallPercentage = () => {
        if (!results.length) return 0;
        const total = results.reduce((acc, curr) => acc + (curr.totalMarks || 100), 0);
        const obtained = results.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
        return ((obtained / total) * 100).toFixed(2);
    };

    const getOverallGrade = (pct) => {
        if (pct >= 90) return "A+";
        if (pct >= 80) return "A";
        if (pct >= 70) return "B";
        if (pct >= 60) return "C";
        if (pct >= 50) return "D";
        return "F";
    };

    const pct = calculateOverallPercentage();
    const overallGrade = getOverallGrade(pct);

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <button
                        onClick={onBack}
                        className="text-slate-500 hover:text-slate-800 font-bold text-sm px-4 py-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-transform active:scale-95"
                    >
                        <FaPrint /> Print Report Card
                    </button>
                </div>

                {/* Printable Content */}
                <div className="flex-1 overflow-y-auto bg-slate-200 p-8 flex justify-center">
                    <div ref={componentRef} className="w-[210mm] bg-white p-[20mm] shadow-lg text-slate-900 border-[12px] border-double border-slate-100 relative">
                        
                        {/* THEORETICAL WATERMARK */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                            <FaSchool size={400} />
                        </div>

                        {/* Header */}
                        <div className="border-b-2 border-slate-900 pb-8 mb-10 text-center relative z-10">
                            <div className="flex flex-col items-center gap-2 mb-4">
                                <FaSchool className="text-5xl text-slate-900 mb-2" />
                                <h1 className="text-4xl font-serif font-bold uppercase tracking-[0.2em] text-slate-900 leading-tight">
                                    {schoolSettings.schoolName}
                                </h1>
                                <div className="h-1 w-32 bg-slate-900 my-2"></div>
                            </div>
                            <p className="text-slate-600 font-serif italic text-lg mb-1 uppercase tracking-widest font-bold">Academic Excellence Report</p>
                            <p className="text-slate-500 text-sm">{schoolSettings.address}</p>
                            <p className="text-slate-500 text-xs mt-1">Ph: {schoolSettings.phone} • Web: {schoolSettings.website}</p>
                        </div>

                        {/* Student Details Grid */}
                        <div className="grid grid-cols-2 gap-12 mb-12 relative z-10">
                            <div className="space-y-4">
                                <div className="border-b border-slate-200 pb-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Student Name</p>
                                    <p className="text-xl font-bold text-slate-900 uppercase">{student.name}</p>
                                </div>
                                <div className="border-b border-slate-200 pb-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Guardian Details</p>
                                    <p className="font-semibold text-slate-800 uppercase">{student.fatherName || "N/A"}</p>
                                </div>
                            </div>
                            <div className="space-y-4 text-right">
                                <div className="border-b border-slate-200 pb-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Registration No. (SRN)</p>
                                    <p className="font-mono font-bold text-lg text-slate-900">{student.admissionId || "N/A"}</p>
                                </div>
                                <div className="border-b border-slate-200 pb-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Class & Section</p>
                                    <p className="font-bold text-slate-800">{student.classId?.name || "N/A"} - {student.classId?.section || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Academic Summary Table */}
                        <div className="mb-12 relative z-10">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-[0.2em]">
                                        <th className="p-4 text-left border border-slate-900">Subject Description</th>
                                        <th className="p-4 text-center border border-slate-900">Max</th>
                                        <th className="p-4 text-center border border-slate-900">Obtained</th>
                                        <th className="p-4 text-center border border-slate-900 w-24">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((r, i) => (
                                        <tr key={i} className="text-sm border-b border-slate-200">
                                            <td className="p-4 font-bold border-l border-r border-slate-300">{r.subject || "General"}</td>
                                            <td className="p-4 text-center font-mono border-r border-slate-300">{r.totalMarks}</td>
                                            <td className="p-4 text-center font-mono font-bold border-r border-slate-300">{r.marksObtained}</td>
                                            <td className="p-4 text-center font-bold border-r border-slate-300">
                                                <span className={`px-3 py-1 rounded bg-slate-50 border ${r.grade === 'F' ? 'text-red-600 border-red-100' : 'text-slate-900 border-slate-200'}`}>
                                                    {r.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Calculation Footer */}
                        <div className="flex justify-between items-start mb-20 relative z-10">
                            <div className="w-64 p-6 bg-slate-50 border-2 border-slate-900 rounded-xl">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest">Aggregate</span>
                                        <span className="font-bold text-lg">{pct}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div style={{ width: `${pct}%` }} className="h-full bg-slate-900"></div>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-lg mt-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Final Rank</span>
                                        <span className="text-xl font-serif font-bold">{overallGrade}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right italic text-slate-500 max-w-xs">
                                <p className="text-sm leading-relaxed mb-4">
                                    "This document certifies the academic achievements of the student for the evaluation period mentioned above."
                                </p>
                                <div className="inline-block p-4 border-2 border-slate-900 rounded-full">
                                    <FaMedal className={`text-3xl ${overallGrade === 'F' ? 'text-slate-300' : 'text-amber-500'}`} />
                                </div>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-3 gap-16 mt-auto relative z-10">
                            <div className="text-center">
                                <div className="h-16 border-b border-slate-400 mb-2 italic text-slate-300 text-xs flex items-end justify-center">E-Signature Validated</div>
                                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500">School Registrar</p>
                            </div>
                            <div className="text-center">
                                <div className="h-16 border-b border-slate-400 mb-2 italic text-slate-300 text-xs flex items-end justify-center">Approval Pending</div>
                                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Principal's Signature</p>
                            </div>
                            <div className="text-center">
                                <div className="h-16 border-b border-slate-400 mb-2"></div>
                                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Parent/Guardian</p>
                            </div>
                        </div>

                        {/* Fine Print */}
                        <div className="mt-12 pt-6 border-t border-slate-100 text-center relative z-10">
                            <p className="text-[8px] text-slate-400 uppercase tracking-[0.3em]">
                                Computer Generated Document • eschool-erp-integrated-secure-report
                            </p>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default StudentReportCard;
