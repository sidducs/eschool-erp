import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const EmergencyBanner = () => {
    const [alert, setAlert] = useState(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const { data } = await api.get('/api/notices');
                // Find active emergency notice
                const emergency = data.find(n => n.isEmergency && (!n.expiresAt || new Date(n.expiresAt) > new Date()));
                if (emergency) {
                    setAlert(emergency);
                }
            } catch (err) {
                console.error("Failed to load alerts");
            }
        };

        fetchAlerts();
        // Poll every 5 minutes for new alerts
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (!alert || !visible) return null;

    return (
        <div className="bg-red-600 text-white px-4 py-3 shadow-md relative animate-pulse-slow z-50">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FaExclamationTriangle className="text-xl animate-bounce" />
                    <div>
                        <p className="font-bold uppercase tracking-wider text-xs text-red-100">Emergency Broadcast</p>
                        <p className="font-bold text-sm md:text-base">{alert.title}: {alert.content}</p>
                    </div>
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="text-white/80 hover:text-white p-1 rounded-full hover:bg-red-700 transition"
                >
                    <FaTimes />
                </button>
            </div>
        </div>
    );
};

export default EmergencyBanner;
