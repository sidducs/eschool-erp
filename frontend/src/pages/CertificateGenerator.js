import { useRef, useContext, useState } from "react";
import { jsPDF } from "jspdf";
import { AuthContext } from "../context/AuthContext";
import { FaCertificate, FaDownload } from "react-icons/fa";

function CertificateGenerator() {
    const { user } = useContext(AuthContext);
    const [generating, setGenerating] = useState(false);
    // const canvasRef = useRef(null);

    const generatePDF = () => {
        setGenerating(true);
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        // Background / Border
        doc.setLineWidth(3);
        doc.setDrawColor(200, 150, 50); // Gold-ish
        doc.rect(10, 10, 277, 190);

        doc.setLineWidth(1);
        doc.setDrawColor(0, 0, 0);
        doc.rect(15, 15, 267, 180);

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(36);
        doc.setTextColor(40, 40, 40);
        doc.text("Certificate of Completion", 148.5, 45, { align: "center" });

        // Decorative Line
        doc.setLineWidth(1);
        doc.setDrawColor(200, 200, 200);
        doc.line(80, 55, 217, 55);

        // This certifies that
        doc.setFont("times", "italic");
        doc.setFontSize(20);
        doc.setTextColor(80, 80, 80);
        doc.text("This is to certify that", 148.5, 75, { align: "center" });

        // Student Name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(40);
        doc.setTextColor(230, 140, 0); // Gold
        doc.text(user.name.toUpperCase(), 148.5, 100, { align: "center" });

        // Body
        doc.setFont("times", "normal");
        doc.setFontSize(18);
        doc.setTextColor(60, 60, 60);
        const text = `Has successfully completed the Term Examination for Class ${user.classId?.name || "Premium Batch"}. We commend your hard work and dedication throughout the academic year.`;
        doc.text(text, 148.5, 125, { align: "center", maxWidth: 200 });

        // Date & Signatures
        const date = new Date().toLocaleDateString();
        doc.setFontSize(14);
        doc.text(`Date: ${date}`, 50, 160);
        doc.text("Principal's Signature", 220, 160);

        doc.setLineWidth(0.5);
        doc.line(200, 155, 260, 155); // Signature Line

        // Save
        doc.save(`${user.name}_Certificate.pdf`);
        setGenerating(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FaCertificate className="text-indigo-600" /> Digital Certificates
                </h1>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center">
                    <FaCertificate className="mx-auto text-yellow-400 text-6xl mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">Completion Certificate</h2>
                    <p className="text-slate-300">Official Document of Academic Excellence</p>
                </div>

                <div className="p-8 text-center space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 max-w-2xl mx-auto">
                        <p className="font-serif text-2xl text-slate-800 italic mb-2">This certifies that</p>
                        <h1 className="text-4xl font-bold text-indigo-600 mb-4">{user.name}</h1>
                        <p className="text-slate-600">
                            Has successfully completed the requirements for the current academic session.
                        </p>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={generatePDF}
                            disabled={generating}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                        >
                            {generating ? "Generating..." : <><FaDownload /> Download PDF</>}
                        </button>
                    </div>

                    <p className="text-xs text-slate-400">
                        *This is a computer generated document and does not require a physical signature.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CertificateGenerator;
