import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FaBus, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import Loader from "../components/Loader";

const StudentTransport = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const { data } = await api.get("/api/transport/routes");
            setRoutes(data);
        } catch (err) {
            console.error("Failed to load routes", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader text="Loading Transport Routes..." />;

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-400 rounded-xl shadow-lg shadow-yellow-400/20 text-yellow-900">
                    <FaBus size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Transport Routes</h2>
                    <p className="text-slate-500">View available bus routes and stops.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {routes.map((route) => (
                    <div key={route._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-lg">{route.routeId}</h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                {route.stops.length} Stops
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center text-slate-600">
                                    <FaMapMarkerAlt className="text-green-500 mr-2" />
                                    <span className="font-medium">{route.startPoint}</span>
                                </div>
                                <div className="h-0.5 flex-1 bg-slate-200 mx-4 relative">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-100 px-2 text-xs text-slate-400">
                                        to
                                    </div>
                                </div>
                                <div className="flex items-center text-slate-600">
                                    <span className="font-medium">{route.endPoint}</span>
                                    <FaMapMarkerAlt className="text-red-500 ml-2" />
                                </div>
                            </div>

                            <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Stops & Timings</h4>
                            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {route.stops.map((stop, index) => (
                                    <div key={index} className="relative flex items-center justify-between pl-8 group">
                                        <div className="absolute left-0 w-5 h-5 rounded-full border-2 border-white bg-slate-300 group-hover:bg-blue-500 transition-colors shadow-sm"></div>
                                        <span className="text-slate-700 font-medium text-sm">{stop.name}</span>
                                        <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                            <FaClock className="mr-1.5 text-slate-400" />
                                            {stop.pickupTime}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {route.assignedVehicle && (
                            <div className="bg-yellow-50 px-6 py-3 border-t border-yellow-100 flex items-center justify-between text-yellow-800 text-sm">
                                <span className="font-bold flex items-center"><FaBus className="mr-2" /> Bus: {route.assignedVehicle.vehicleNumber}</span>
                                <span className="flex items-center">Driver: {route.assignedVehicle.driverName}</span>
                            </div>
                        )}
                    </div>
                ))}
                {routes.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        No active transport routes found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentTransport;
