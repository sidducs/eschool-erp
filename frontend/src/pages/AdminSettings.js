import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FaCogs, FaSave, FaEye } from "react-icons/fa";

function AdminSettings() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        srnPrefix: "",
        srnYearFormat: "YY",
        srnSeparator: "-",
        currentSequence: 0,
        schoolName: "",
        address: "",
        phone: "",
        email: "",
        website: ""
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get("/api/settings");
            setSettings(res.data);
        } catch (err) {
            console.error("Failed to load settings");
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put("/api/settings", settings);
            alert("✅ Settings Updated Successfully!");
        } catch (err) {
            alert("❌ Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    // Preview Logic
    const getPreview = () => {
        const now = new Date();
        let year = "";
        if (settings.srnYearFormat === "YYYY") year = now.getFullYear();
        else if (settings.srnYearFormat === "YY") year = now.getFullYear().toString().slice(-2);

        const padding = settings.srnPadding || 4;
        const seq = (Number(settings.currentSequence) + 1).toString().padStart(padding, "0");
        const sep = settings.srnSeparator || "";

        // Order: Year + Sep + Prefix + Sep + Seq
        const parts = [];
        if (year) parts.push(year);
        if (settings.srnPrefix) parts.push(settings.srnPrefix);
        parts.push(seq);

        return parts.join(sep);
    };

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">
                    <FaCogs size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
                    <p className="text-slate-500 text-sm">Configure global application preferences.</p>
                </div>
            </div>

            {/* SCHOOL INFORMATION SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">Institution Information</h3>
                    <p className="text-xs text-slate-500">Details appearing on Report Cards, Receipts, and Official Documents.</p>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">School / College Name</label>
                        <input
                            type="text"
                            name="schoolName"
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                            placeholder="e.g. ESchool Academy"
                            value={settings.schoolName || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="+91 98765 43210"
                            value={settings.phone || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="info@eschool.com"
                            value={settings.email || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Website URL</label>
                        <input
                            type="text"
                            name="website"
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="www.eschool.com"
                            value={settings.website || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Address</label>
                        <textarea
                            name="address"
                            rows="3"
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="123 Education Lane, Knowledge City, State - Zip Code"
                            value={settings.address || ""}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">Student Identity (SRN) Configuration</h3>
                    <p className="text-xs text-slate-500">Define how the Student Registration Number is auto-generated.</p>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Institution / ID Prefix</label>
                            <input
                                type="text"
                                name="srnPrefix"
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold"
                                placeholder="e.g. ESA"
                                value={settings.srnPrefix}
                                onChange={handleChange}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Short code for your school/college.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Year Format</label>
                            <select
                                name="srnYearFormat"
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none"
                                value={settings.srnYearFormat}
                                onChange={handleChange}
                            >
                                <option value="YYYY">Full Year (e.g. 2024)</option>
                                <option value="YY">Short Year (e.g. 24)</option>
                                <option value="none">No Year</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Separator</label>
                            <select
                                name="srnSeparator"
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-mono"
                                value={settings.srnSeparator}
                                onChange={handleChange}
                            >
                                <option value="-">Dash (-)</option>
                                <option value="/">Slash (/)</option>
                                <option value="">None (Concatenate)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sequence Padding (Digits)</label>
                            <input
                                type="number"
                                name="srnPadding"
                                min="2" max="10"
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-mono"
                                value={settings.srnPadding || 4}
                                onChange={handleChange}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">E.g. 3 = 001, 4 = 0001</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Current Sequence Start</label>
                            <input
                                type="number"
                                name="currentSequence"
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-mono"
                                value={settings.currentSequence}
                                onChange={handleChange}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">The next student will be this number + 1.</p>
                        </div>
                    </div>

                    {/* PREVIEW BOX */}
                    <div className="flex flex-col justify-center items-center bg-slate-900 rounded-2xl p-8 text-white text-center">
                        <FaEye className="text-3xl mb-4 text-slate-400" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Live Preview</p>
                        <div className="text-4xl font-mono font-bold tracking-wider text-green-400 bg-slate-800 px-6 py-4 rounded-xl border border-slate-700 shadow-inner">
                            {getPreview()}
                        </div>
                        <p className="text-slate-500 text-xs mt-4 max-w-xs">
                            This is how the ID will be generated for the next admitted student.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {loading ? "Saving..." : <><FaSave /> Save Configuration</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminSettings;
