import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FaPrint, FaUserGraduate, FaUniversity, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import Loader from '../components/Loader';

const StudentIDCard = () => {
    const { user } = useContext(AuthContext);
    const [scData, setScData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/settings'); // Assuming settings has school info
                setScData(res.data);
            } catch (err) {
                console.error("Failed to load school settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <Loader text="Generating ID Card..." />;

    const schoolName = scData?.schoolName || "ESchool ERP Academy";
    const schoolAddress = scData?.address || "123 Education Lane, Academic City";

    return (
        <div className="flex flex-col items-center p-8 animate-fadeIn">
            <div className="flex justify-between items-center w-full max-w-md mb-8 no-print">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Digital Student ID</h2>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95"
                >
                    <FaPrint /> Print Card
                </button>
            </div>

            {/* ID CARD CONTAINER */}
            <div className="id-card-relative bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 w-[350px] transition-all hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="relative z-10 flex flex-col items-center gap-2">
                        <FaUniversity size={32} className="mb-1" />
                        <h1 className="font-extrabold text-xl tracking-tight leading-tight">{schoolName}</h1>
                        <p className="text-[10px] opacity-80 uppercase font-bold tracking-[0.2em]">Official Identity Card</p>
                    </div>
                </div>

                {/* Body Section */}
                <div className="p-8 flex flex-col items-center">
                    {/* Profile Image Placeholder */}
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl mb-6 flex items-center justify-center overflow-hidden">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <FaUserGraduate size={64} className="text-slate-300 dark:text-slate-600" />
                        )}
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1 uppercase text-center">{user?.name}</h2>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-6 uppercase tracking-wider">Student ID: {user?.admissionId || "SC-2024-001"}</p>

                    <div className="w-full space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <FaCalendarAlt size={14} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Section / Roll</p>
                                <p className="text-slate-700 dark:text-slate-200 text-sm font-bold">{user?.section || "A"} / {user?.rollNumber || "21"}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <FaPhone size={14} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Emergency Contact</p>
                                <p className="text-slate-700 dark:text-slate-200 text-sm font-bold">{user?.phone || "+91 91234 56780"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <FaMapMarkerAlt size={14} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">School Address</p>
                                <p className="text-slate-700 dark:text-slate-200 text-xs font-medium leading-tight">{schoolAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center">
                    <div className="w-24 h-6 bg-slate-200 dark:bg-slate-700 rounded-sm opacity-50 flex items-center justify-center text-[8px] font-mono text-slate-500">
                        |||| BARCODE ||||
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .id-card-relative { 
                        box-shadow: none !important; 
                        border: 1px solid #e2e8f0 !important;
                        margin: 0 auto !important;
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default StudentIDCard;
