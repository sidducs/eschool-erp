import { useState, useEffect, useContext, useRef } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { FaPaperPlane, FaUserCircle, FaSearch, FaCommentDots } from "react-icons/fa";
import Loader from "../components/Loader";

function Chat() {
    const { user } = useContext(AuthContext);
    const [contacts, setContacts] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const scrollRef = useRef();

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
            const interval = setInterval(() => fetchMessages(selectedUser._id), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchContacts = async () => {
        try {
            const res = await api.get("/api/chat/contacts/list");
            setContacts(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load contacts");
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await api.get(`/api/chat/${userId}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to load messages");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const payload = { receiverId: selectedUser._id, message: newMessage };
            const res = await api.post("/api/chat/send", payload);
            setMessages([...messages, res.data]);
            setNewMessage("");
        } catch (err) {
            console.error("Failed to send message");
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.admissionId && c.admissionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.classId?.name && c.classId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <Loader text="Loading Chat..." />;

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Sidebar / Contact List */}
            <div className={`w-full md:w-1/3 border-r border-slate-100 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-bold text-slate-700 flex items-center gap-2 mb-3">
                        <FaCommentDots className="text-indigo-600" /> Messages
                    </h2>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredContacts.length === 0 ? (
                        <p className="p-6 text-center text-slate-400 text-sm">No contacts found.</p>
                    ) : (
                        filteredContacts.map(contact => (
                            <div
                                key={contact._id}
                                onClick={() => setSelectedUser(contact)}
                                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition border-b border-slate-50 ${selectedUser?._id === contact._id ? "bg-indigo-50 border-l-4 border-l-indigo-600" : ""}`}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                        <FaUserCircle size={24} />
                                    </div>
                                    {contact.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                            {contact.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex justify-between w-full">
                                        <h4 className={`font-bold text-sm ${contact.unreadCount > 0 ? "text-slate-900" : "text-slate-800"}`}>
                                            {contact.name} ({contact.role})
                                        </h4>
                                        {contact.lastMessageTime !== 0 && (
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(contact.lastMessageTime).toLocaleDateString() === new Date().toLocaleDateString()
                                                    ? new Date(contact.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : new Date(contact.lastMessageTime).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center w-full">
                                        <p className={`text-xs truncate max-w-[150px] ${contact.unreadCount > 0 ? "font-bold text-slate-800" : "text-slate-500"}`}>
                                            {contact.lastMessage || "No messages yet"}
                                        </p>
                                        {contact.unreadCount > 0 && (
                                            <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                {contact.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`w-full md:w-2/3 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedUser(null)} className="md:hidden text-slate-500 mr-2">
                                    &larr;
                                </button>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{selectedUser.name}</h4>
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((msg, index) => {
                                const isMe = msg.sender._id === user._id || msg.sender === user._id; // Handle populated or raw ID
                                return (
                                    <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isMe
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white text-slate-700 rounded-tl-none border border-slate-200"
                                            }`}>
                                            <p>{msg.message}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition shadow-sm"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                        <FaCommentDots size={64} className="mb-4 text-slate-200" />
                        <p className="text-lg font-bold text-slate-400">Select a contact to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
