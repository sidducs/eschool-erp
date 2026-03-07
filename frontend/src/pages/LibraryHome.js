import React, { useState, useContext, useEffect, useCallback } from 'react';
import api from "../services/api";
import { AuthContext } from '../context/AuthContext';
import {
  FaSearch, FaMapMarkerAlt, FaRobot, FaCheck, FaTimes,
  FaBookReader, FaCheckCircle, FaExclamationTriangle, FaSpinner
} from "react-icons/fa";

const LibraryHome = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("search"); // 'search' | 'my-books'
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [results, setResults] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [issuingBookId, setIssuingBookId] = useState(null);
  const [srnInput, setSrnInput] = useState("");
  const [issueStatus, setIssueStatus] = useState({ id: null, msg: "", type: "" });

  // Define functions first to avoid hoisting issues
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/library/search?query=${query}&sort=${sortOption}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search Error");
    } finally {
      setLoading(false);
    }
  }, [query, sortOption]);

  const fetchMyBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/library/my-books");
      setMyBooks(res.data);
    } catch (err) {
      console.error("Failed to fetch my books");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effects
  // Fetch My Books when tab changes
  useEffect(() => {
    if (activeTab === "my-books") {
      fetchMyBooks();
    } else if (activeTab === "search") {
      fetchBooks();
    }
  }, [activeTab, sortOption, fetchBooks, fetchMyBooks]); // Re-fetch when tab or sort changes

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeTab === "search") {
        fetchBooks();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab, fetchBooks]);

  // Handlers
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchBooks();
  };

  const clearSearch = () => {
    setQuery("");
    setIssueStatus({ id: null, msg: "", type: "" });
    // fetchBooks will be triggered by useEffect when query becomes empty
  };

  const submitIssue = async (bookId) => {
    if (!srnInput) return;
    try {
      const res = await api.post('/api/library/issue', { bookId, admissionId: srnInput });

      setIssueStatus({ id: bookId, msg: res.data.message, type: "success" });
      setIssuingBookId(null);
      setSrnInput("");

      setTimeout(async () => {
        setIssueStatus({ id: null, msg: "", type: "" });
        // Refresh results to show updated availability
        const updated = await api.get(`/api/library/search?query=${query}&sort=${sortOption}`);
        setResults(updated.data);
      }, 2000);

    } catch (err) {
      setIssueStatus({
        id: bookId,
        msg: err.response?.data?.message || "Failed",
        type: "danger"
      });
      setTimeout(() => setIssueStatus({ id: null, msg: "", type: "" }), 3000);
    }
  };

  return (
    <div className="w-full">

      {/* 🔔 LOCAL TOAST */}
      {issueStatus.msg && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center p-4 mb-4 rounded-lg shadow-2xl animate-bounceIn
            ${issueStatus.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
          role="alert"
        >
          <div className="text-lg mr-3">
            {issueStatus.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
          </div>
          <div className="font-bold text-sm">
            {issueStatus.msg}
          </div>
          <button
            type="button"
            className="ml-4 -mx-1.5 -my-1.5 bg-transparent text-white rounded-lg p-1.5 hover:bg-white/20 inline-flex h-8 w-8"
            onClick={() => setIssueStatus({ id: null, msg: "", type: "" })}
          >
            <FaTimes />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold font-sans text-slate-800 flex items-center gap-2">
          <FaRobot className="text-blue-600" /> AI Smart Library
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "search" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <FaSearch className="inline mr-1" /> Search
          </button>
          {user?.role !== 'admin' && (
            <button
              onClick={() => setActiveTab("my-books")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "my-books" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
            >
              <FaBookReader className="inline mr-1" /> Issued Books
            </button>
          )}
        </div>
      </div>

      {activeTab === "my-books" && (
        <div className="max-w-4xl mx-auto">
          {loading ? <div className="text-center py-12"><FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto" /></div> : (
            myBooks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                <FaBookReader className="text-4xl text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">You don't have any books issued currently.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myBooks.map((item) => (
                  <div key={item._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                      <FaBookReader size={24} />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-slate-800 line-clamp-1">{item.bookId?.title}</h5>
                      <p className="text-sm text-slate-500 mb-2">by {item.bookId?.author}</p>
                      <div className="text-xs bg-slate-100 p-2 rounded-lg space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Issued On:</span>
                          <span className="font-bold text-slate-700">{new Date(item.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Due Date:</span>
                          <span className={`font-bold ${new Date() > new Date(item.dueDate) ? "text-red-500" : "text-green-600"}`}>
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {activeTab === "search" && (
        <div className="max-w-6xl mx-auto mb-10 animate-fadeIn">
          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="relative flex-1">
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${loading ? "text-blue-500" : "text-slate-400 group-focus-within:text-blue-500"}`}>
                  {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                </div>
                <input
                  type="text"
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-slate-800 placeholder-slate-400 transition-all font-medium"
                  placeholder="Search by Title, Author, or ISBN..."
                  value={query}
                  disabled={loading}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </form>

            {/* SORTING DROPDOWN */}
            <div className="w-full md:w-64">
              <select
                className="w-full h-full p-3 bg-white border border-slate-200 rounded-xl shadow-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
                <option value="author_asc">Author (A-Z)</option>
                <option value="available">Availability</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center px-2">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
              Found {results.length} {results.length === 1 ? 'Book' : 'Books'}
            </span>
          </div>
        </div>
      )}

      {activeTab === "search" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((book) => {
            const isAvailable = book.availableCopies > 0;

            return (
              <div key={book._id} className="group relative">
                <div
                  className={`h-full bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden
                      ${!isAvailable ? 'bg-slate-50 border-slate-200 opacity-80' : 'border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200'}`}
                >

                  {/* STATUS OVERLAY */}
                  {issueStatus.id === book._id && issueStatus.type === "success" && (
                    <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                        <FaCheckCircle size={32} />
                      </div>
                      <p className="font-bold text-green-800">{issueStatus.msg}</p>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Book Icon/Image Placeholder */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isAvailable ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <FaBookReader size={24} />
                    </div>

                    <div className="mb-4">
                      <h6
                        className={`font-bold text-lg leading-tight mb-1 line-clamp-2 ${!isAvailable ? 'text-slate-500' : 'text-slate-800 group-hover:text-blue-700'}`}
                        title={book.title}
                      >
                        {book.title}
                      </h6>
                      <p className="text-sm font-medium text-slate-500">by <span className="text-slate-700">{book.author}</span></p>
                      {book.pdfUrl && (
                        <a
                          href={book.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full hover:bg-purple-200 transition"
                        >
                          📖 Read Online
                        </a>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-xs text-slate-500 font-medium">
                          <FaMapMarkerAlt className="mr-1 text-slate-400" /> {book.location || "Shelf A1"}
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-md border
                            ${isAvailable ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}
                        >
                          {isAvailable ? `${book.availableCopies} Left` : 'Out of Stock'}
                        </span>
                      </div>

                      {user?.role === 'admin' && (
                        <div className="h-10">
                          {issuingBookId === book._id ? (
                            <div className="flex gap-2 animate-fadeIn">
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter Student SRN"
                                autoFocus
                                value={srnInput}
                                onChange={(e) => setSrnInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submitIssue(book._id)}
                              />
                              <button
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => submitIssue(book._id)}
                              >
                                <FaCheck size={12} />
                              </button>
                              <button
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                onClick={() => { setIssuingBookId(null); setSrnInput(""); }}
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95
                                ${isAvailable
                                  ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-md hover:shadow-blue-500/30'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                              onClick={() => isAvailable && setIssuingBookId(book._id)}
                              disabled={!isAvailable}
                            >
                              {isAvailable
                                ? <><FaBookReader /> Issue Book</>
                                : <><FaExclamationTriangle /> Unavailable</>
                              }
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LibraryHome;
