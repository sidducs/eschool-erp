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
        content: () => componentRef.current,
        documentTitle: `ReportCard_${student.name || "Student"}`,
        onAfterPrint: () => console.log("Print finished"),
        onBeforeGetContent: () => {
            if (!componentRef.current) {
                console.error("Component Ref is null");
                return Promise.reject("Ref is null");
            }
            return Promise.resolve();
        }
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
                <div className="flex-1 overflow-y-auto bg-slate-200 p-8">
                    <div ref={componentRef} className="max-w-[210mm] mx-auto bg-white p-[10mm] shadow-sm min-h-[297mm] text-slate-900 relative">

                        {/* Header */}
                        <div className="border-b-4 border-double border-slate-900 pb-6 mb-8 text-center">
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <FaSchool className="text-4xl text-slate-900" />
                                <h1 className="text-3xl font-serif font-bold uppercase tracking-widest text-slate-900">{schoolSettings.schoolName}</h1>
                            </div>
                            <p className="text-slate-500 text-sm font-serif italic">Excellence in Education • Est. 2024</p>
                            <p className="text-slate-500 text-sm">{schoolSettings.address}</p>
                        </div>

                        {/* Report Title */}
                        <div className="text-center mb-10">
                            <span className="inline-block px-8 py-2 border-2 border-slate-900 text-xl font-serif font-bold uppercase tracking-widest">
                                Official Report Card
                            </span>
                            <p className="mt-2 text-slate-500 font-medium">Academic Year 2024-2025</p>
                        </div>

                        {/* Student Details */}
                        <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
                            <div className="space-y-2">
                                <div className="flex"><span className="w-32 font-bold uppercase text-slate-500 text-xs tracking-wider pt-1">Student Name</span> <span className="text-lg font-bold text-slate-800 uppercase">{student.name}</span></div>
                                <div className="flex"><span className="w-32 font-bold uppercase text-slate-500 text-xs tracking-wider pt-1">Father's Name</span> <span className="font-semibold text-slate-700 uppercase">{student.fatherName || "N/A"}</span></div>
                                <div className="flex"><span className="w-32 font-bold uppercase text-slate-500 text-xs tracking-wider pt-1">Mother's Name</span> <span className="font-semibold text-slate-700 uppercase">{student.motherName || "N/A"}</span></div>
                                <div className="flex"><span className="w-32 font-bold uppercase text-slate-500 text-xs tracking-wider pt-1">Date of Birth</span> <span className="font-semibold text-slate-700">{student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}</span></div>
                            </div>
                            <div className="space-y-2 text-right">
                                <div className="flex justify-end"><span className="w-32 font-bold uppercase text-slate-500 text-xs tracking-wider pt-1">Class</span> <span className="text-lg font-bold text-slate-800">{student.classId?.name || "10"} - {student.classId?.section || "A"}</span></div>
                                <div className="flex justify-end"><span className="w-32 font-bold uppercase text-slate-500 text-xs tracking-wider pt-1">SRN</span> <span className="font-mono font-bold text-slate-700">{student.admissionId || "N/A"}</span></div>
                            </div>
                        </div>

                        {/* Grades Table */}
                        <table className="w-full border-collapse border border-slate-900 mb-10">
                            <thead>
                                <tr className="bg-slate-50 text-slate-900 uppercase text-xs font-bold tracking-wider">
                                    <th className="border border-slate-900 p-3 text-left w-1/3">Subject</th>
                                    <th className="border border-slate-900 p-3 text-center">Max Marks</th>
                                    <th className="border border-slate-900 p-3 text-center">Obtained</th>
                                    <th className="border border-slate-900 p-3 text-center">Grade</th>
                                    <th className="border border-slate-900 p-3 text-left w-1/3">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <tr key={i} className="text-sm">
                                        <td className="border border-slate-900 p-3 font-bold font-serif">{r.subject || "General"}</td>
                                        <td className="border border-slate-900 p-3 text-center font-mono">{r.totalMarks}</td>
                                        <td className="border border-slate-900 p-3 text-center font-mono font-bold">{r.marksObtained}</td>
                                        <td className="border border-slate-900 p-3 text-center font-bold">{r.grade}</td>
                                        <td className="border border-slate-900 p-3 italic text-slate-600">{r.remarks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Summary */}
                        <div className="flex gap-8 mb-16">
                            <div className="flex-1 border border-slate-900 p-4">
                                <h4 className="font-bold uppercase text-xs text-slate-500 tracking-wider mb-2">Overall Performance</h4>
                                <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-2">
                                    <span>Percentage</span>
                                    <span className="font-mono font-bold text-xl">{pct}%</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span>Final Grade</span>
                                    <span className="font-serif font-bold text-2xl">{overallGrade}</span>
                                </div>
                            </div>
                            <div className="flex-1 border border-slate-900 p-4 flex items-center justify-center bg-slate-50">
                                <div className="text-center">
                                    <FaMedal className="text-4xl text-slate-400 mx-auto mb-2" />
                                    <p className="font-serif italic font-bold text-slate-600">
                                        {overallGrade === "F" ? "Failed" : overallGrade === "A+" || overallGrade === "A" ? "Distinction" : "Promoted"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-3 gap-10 mt-auto pt-20">
                            <div className="text-center">
                                <div className="border-t border-slate-900 pt-2">
                                    <p className="font-bold text-xs uppercase tracking-wider">Class Teacher</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="border-t border-slate-900 pt-2">
                                    <p className="font-bold text-xs uppercase tracking-wider">Principal</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="border-t border-slate-900 pt-2">
                                    <p className="font-bold text-xs uppercase tracking-wider">Parent / Guardian</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-5 left-0 right-0 text-center">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Generated by ESchool ERP System</p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentReportCard;
