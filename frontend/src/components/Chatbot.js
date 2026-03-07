import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from "react-icons/fa";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "model", text: "Hi! I'm your AI Assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Format history for Gemini (excluding the last new message)
            const history = messages.map(m => ({
                role: m.role === "admin" ? "user" : "model", // Map roles if needed, gemini uses 'user' and 'model'
                parts: [{ text: m.text }]
            }));

            const res = await api.post("/api/chat/ask", {
                message: input,
                history: history // functional history context
            });

            setMessages((prev) => [...prev, { role: "model", text: res.data.reply }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: "model", text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 animate-fadeIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-2 rounded-full">
                                <FaRobot />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">School AI Assistant</h3>
                                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition">
                            <FaTimes size={14} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm"
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            <FaPaperPlane size={14} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? "scale-0" : "scale-100"} transition-transform duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center`}
            >
                <FaCommentDots size={28} />
            </button>
        </div>
    );
};

export default Chatbot;
