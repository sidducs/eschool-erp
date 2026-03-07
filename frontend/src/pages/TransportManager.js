import { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "../components/ConfirmationModal";
import { FaBus, FaMapMarkerAlt, FaTrash, FaUserGraduate } from "react-icons/fa";

function TransportManager() {
    const { addToast } = useToast();
    const [routes, setRoutes] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [activeTab, setActiveTab] = useState("vehicles");
    // const [loading, setLoading] = useState(true); // Unused
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

    // Forms
    const [routeForm, setRouteForm] = useState({ routeId: "", startPoint: "", endPoint: "", stops: [] });
    const [vehicleForm, setVehicleForm] = useState({ vehicleNumber: "", driverName: "", driverContact: "", capacity: "", routeId: "" });

    // Stop Input
    const [newStop, setNewStop] = useState({ name: "", pickupTime: "", fees: "" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [routesRes, vehiclesRes] = await Promise.all([
                    api.get("/api/transport/routes"),
                    api.get("/api/transport/vehicles")
                ]);
                setRoutes(routesRes.data);
                setVehicles(vehiclesRes.data);
                // setLoading(false);
            } catch (err) {
                addToast("Failed to load transport data", "error");
                // setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line
    }, []);

    const handleRouteSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/api/transport/routes", routeForm);
            setRoutes([...routes, res.data]);
            addToast("Route added", "success");
            setRouteForm({ routeId: "", startPoint: "", endPoint: "", stops: [] });
        } catch (err) {
            addToast("Failed to add route", "error");
        }
    };

    const handleVehicleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/api/transport/vehicles", vehicleForm);
            setVehicles([...vehicles, res.data]);
            addToast("Vehicle added", "success");
            setVehicleForm({ vehicleNumber: "", driverName: "", driverContact: "", capacity: "", routeId: "" });
        } catch (err) {
            addToast("Failed to add vehicle", "error");
        }
    };

    const deleteVehicle = async (id) => {
        try {
            await api.delete(`/api/transport/vehicles/${id}`);
            setVehicles(vehicles.filter(v => v._id !== id));
            addToast("Vehicle deleted successfully", "success");
        } catch (err) {
            addToast("Failed to delete vehicle", "error");
        }
    };

    const addStop = () => {
        if (!newStop.name || !newStop.pickupTime) return;
        setRouteForm({ ...routeForm, stops: [...routeForm.stops, newStop] });
        setNewStop({ name: "", pickupTime: "", fees: "" });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FaBus className="text-yellow-600" /> Transport Management
            </h2>

            <div className="flex space-x-4 border-b border-slate-200 pb-2">
                <button
                    onClick={() => setActiveTab("vehicles")}
                    className={`pb-2 px-4 font-bold ${activeTab === "vehicles" ? "text-yellow-600 border-b-2 border-yellow-600" : "text-slate-500"}`}
                >
                    Vehicles
                </button>
                <button
                    onClick={() => setActiveTab("routes")}
                    className={`pb-2 px-4 font-bold ${activeTab === "routes" ? "text-yellow-600 border-b-2 border-yellow-600" : "text-slate-500"}`}
                >
                    Routes
                </button>
                <button
                    onClick={() => setActiveTab("assign")}
                    className={`pb-2 px-4 font-bold ${activeTab === "assign" ? "text-yellow-600 border-b-2 border-yellow-600" : "text-slate-500"}`}
                >
                    Assign Students
                </button>
            </div>

            {activeTab === "vehicles" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-700 mb-4">Add Vehicle</h4>
                        <form onSubmit={handleVehicleSubmit} className="space-y-4">
                            <input className="w-full border p-2 rounded text-sm" placeholder="Vehicle Number (KA-01...)" value={vehicleForm.vehicleNumber} onChange={e => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })} required />
                            <input className="w-full border p-2 rounded text-sm" placeholder="Driver Name" value={vehicleForm.driverName} onChange={e => setVehicleForm({ ...vehicleForm, driverName: e.target.value })} required />
                            <input className="w-full border p-2 rounded text-sm" placeholder="Driver Contact" value={vehicleForm.driverContact} onChange={e => setVehicleForm({ ...vehicleForm, driverContact: e.target.value })} required />
                            <input type="number" className="w-full border p-2 rounded text-sm" placeholder="Capacity" value={vehicleForm.capacity} onChange={e => setVehicleForm({ ...vehicleForm, capacity: e.target.value })} required />
                            <select className="w-full border p-2 rounded text-sm" value={vehicleForm.routeId} onChange={e => setVehicleForm({ ...vehicleForm, routeId: e.target.value })}>
                                <option value="">Assign Route (Optional)</option>
                                {routes.map(r => <option key={r._id} value={r._id}>{r.routeId}: {r.startPoint} - {r.endPoint}</option>)}
                            </select>
                            <button type="submit" className="w-full bg-yellow-600 text-white font-bold py-2 rounded">Add Vehicle</button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-700 mb-4">Fleet Overview</h4>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-3">Bus No</th>
                                    <th className="p-3">Driver</th>
                                    <th className="p-3">Phone</th>
                                    <th className="p-3">Route</th>
                                    <th className="p-3">Capacity</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.map(v => (
                                    <tr key={v._id} className="border-b hover:bg-slate-50">
                                        <td className="p-3 font-bold">{v.vehicleNumber}</td>
                                        <td className="p-3">{v.driverName}</td>
                                        <td className="p-3">{v.driverContact}</td>
                                        <td className="p-3">{v.routeId ? v.routeId.routeId : "Unassigned"}</td>
                                        <td className="p-3">{v.capacity}</td>
                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() => setModal({
                                                    isOpen: true,
                                                    title: "Delete Vehicle?",
                                                    message: `Delete vehicle ${v.vehicleNumber}?`,
                                                    onConfirm: () => deleteVehicle(v._id)
                                                })}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "routes" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-700 mb-4">Add Route</h4>
                        <form onSubmit={handleRouteSubmit} className="space-y-4">
                            <input className="w-full border p-2 rounded text-sm" placeholder="Route ID (R-01)" value={routeForm.routeId} onChange={e => setRouteForm({ ...routeForm, routeId: e.target.value })} required />
                            <input className="w-full border p-2 rounded text-sm" placeholder="Start Point" value={routeForm.startPoint} onChange={e => setRouteForm({ ...routeForm, startPoint: e.target.value })} required />
                            <input className="w-full border p-2 rounded text-sm" placeholder="End Point" value={routeForm.endPoint} onChange={e => setRouteForm({ ...routeForm, endPoint: e.target.value })} required />

                            <div className="border-t pt-2">
                                <p className="text-xs font-bold mb-2">Add Stops</p>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    <input className="border p-1 text-xs rounded" placeholder="Stop Name" value={newStop.name} onChange={e => setNewStop({ ...newStop, name: e.target.value })} />
                                    <input className="border p-1 text-xs rounded" placeholder="Time" value={newStop.pickupTime} onChange={e => setNewStop({ ...newStop, pickupTime: e.target.value })} />
                                    <input className="border p-1 text-xs rounded" placeholder="Fee" type="number" value={newStop.fees} onChange={e => setNewStop({ ...newStop, fees: e.target.value })} />
                                </div>
                                <button type="button" onClick={addStop} className="w-full bg-slate-200 text-slate-700 text-xs font-bold py-1 rounded">Add Stop</button>

                                <ul className="mt-2 text-xs space-y-1">
                                    {routeForm.stops.map((s, idx) => (
                                        <li key={idx} className="flex justify-between bg-slate-50 p-1 rounded">
                                            <span>{s.name} ({s.pickupTime})</span>
                                            <span className="font-mono">₹{s.fees}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded">Save Route</button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-700 mb-4">Active Routes</h4>
                        <div className="space-y-4">
                            {routes.map(r => (
                                <div key={r._id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h5 className="font-bold text-lg text-slate-800">{r.routeId}: {r.startPoint} <span className="text-slate-400">→</span> {r.endPoint}</h5>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {r.stops.map((s, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border flex items-center gap-1">
                                                <FaMapMarkerAlt size={10} /> {s.name} <span className="text-slate-400">|</span> {s.pickupTime}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "assign" && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-fadeIn max-w-2xl mx-auto">
                    <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <FaUserGraduate className="text-blue-600" /> Assign Transport to Student
                    </h4>
                    <TransportAssignmentForm routes={routes} />
                </div>
            )
            }
            {/* Global Confirmation Modal */}
            <ConfirmationModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                onClose={() => setModal({ ...modal, isOpen: false })}
            />
        </div>
    );
}

function TransportAssignmentForm({ routes }) {
    const { addToast } = useToast();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ studentId: "", routeId: "", stopName: "", transportFee: "" });

    useEffect(() => {
        api.get("/api/admin/users").then(res => {
            setStudents(res.data.filter(u => u.role === 'student'));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const selectedRoute = routes.find(r => r._id === formData.routeId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/transport/assign", formData);
            addToast("Transport Assigned Successfully", "success");
            setFormData({ studentId: "", routeId: "", stopName: "", transportFee: "" });
        } catch (err) {
            addToast("Failed to assign transport", "error");
        }
    };

    if (loading) return <p>Loading Students...</p>;

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    required
                >
                    <option value="">Choose Student...</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.admissionId || "No SRN"})</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Route</label>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.routeId}
                    onChange={e => setFormData({ ...formData, routeId: e.target.value, stopName: "", transportFee: "" })}
                    required
                >
                    <option value="">Choose Route...</option>
                    {routes.map(r => <option key={r._id} value={r._id}>{r.routeId}: {r.startPoint} - {r.endPoint}</option>)}
                </select>
            </div>

            {selectedRoute && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Stop</label>
                        <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                            value={formData.stopName}
                            onChange={e => {
                                const stop = selectedRoute.stops.find(s => s.name === e.target.value);
                                setFormData({ ...formData, stopName: e.target.value, transportFee: stop ? stop.fees : "" });
                            }}
                            required
                        >
                            <option value="">Choose Stop...</option>
                            {selectedRoute.stops.map((s, idx) => <option key={idx} value={s.name}>{s.name} ({s.pickupTime})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fee (₹)</label>
                        <input className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-50" value={formData.transportFee} readOnly />
                    </div>
                </div>
            )}

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-0.5">
                Assign Transport
            </button>
        </form>
    );
}

export default TransportManager;
