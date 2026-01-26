import React, { useState, useContext } from 'react';
import api from "../services/api"; 
import { AuthContext } from '../context/AuthContext';
import { 
  FaSearch, FaMapMarkerAlt, FaRobot, FaCheck, FaTimes, 
  FaBookReader, FaCheckCircle, FaExclamationTriangle, FaTrashAlt 
} from "react-icons/fa";

const LibraryHome = () => {
  const { user } = useContext(AuthContext); 
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [issuingBookId, setIssuingBookId] = useState(null);
  const [rollNoInput, setRollNoInput] = useState("");
  const [issueStatus, setIssueStatus] = useState({ id: null, msg: "", type: "" });

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || query.length < 3) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/library/search?query=${query}`);
      setResults(res.data);
      setIssueStatus({ id: null, msg: "", type: "" });
    } catch (err) {
      console.error("Search Error");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIssueStatus({ id: null, msg: "", type: "" });
  };

  const submitIssue = async (bookId) => {
    if (!rollNoInput) return;
    try {
      const res = await api.post('/api/library/issue', { bookId, rollNumber: rollNoInput });
      
      setIssueStatus({ id: bookId, msg: res.data.message, type: "success" });
      setIssuingBookId(null);
      setRollNoInput("");

      setTimeout(async () => {
        setIssueStatus({ id: null, msg: "", type: "" });
        const updated = await api.get(`/api/library/search?query=${query}`);
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
    <div className="container-fluid px-2 mt-2">

      {/* 🔔 LOCAL TOAST (still works inside this page) */}
      {issueStatus.msg && (
        <div 
          className={`toast align-items-center text-white position-fixed top-0 end-0 m-3 show shadow 
            ${issueStatus.type === "success" ? "bg-success" : "bg-danger"}`}
          style={{ zIndex: 9999, minWidth: "260px" }}
        >
          <div className="d-flex">
            <div className="toast-body fw-bold" style={{ fontSize: "0.8rem" }}>
              {issueStatus.type === "success" ? "✔ " : "✖ "}
              {issueStatus.msg}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setIssueStatus({ id: null, msg: "", type: "" })}
            ></button>
          </div>
        </div>
      )}

      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <FaRobot className="text-primary me-2"/>AI Smart Library
        </h2>
        <p className="text-muted small">Semantic search powered by Gemini AI</p>
      </div>

      <div className="mx-auto mb-4" style={{ maxWidth: '650px' }}>
        <form onSubmit={handleSearch}>
          <div className="input-group input-group-lg shadow-sm">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search for books, topics, or authors..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button 
                className="btn btn-white border-y border-start-0 text-muted" 
                type="button" 
                onClick={clearSearch}
              >
                <FaTimes />
              </button>
            )}
            <button className="btn btn-primary px-4" type="submit">
              {loading ? <span className="spinner-border spinner-border-sm"></span> : <FaSearch />}
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-2">
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-bold" style={{ fontSize: '0.75rem' }}>
              Showing {results.length} {results.length === 1 ? 'Book' : 'Books'} Found
            </span>
            <button 
              className="btn btn-link text-danger text-decoration-none p-0 small fw-bold" 
              onClick={clearSearch}
              style={{ fontSize: '0.75rem' }}
            >
              <FaTrashAlt className="me-1"/> Clear Results
            </button>
          </div>
        )}
      </div>

      <div className="row g-4">
        {results.map((book) => {
          const isAvailable = book.availableCopies > 0;
          
          return (
            <div className="col-sm-12 col-md-6 col-lg-4" key={book._id}>
              <div 
                className={`card h-100 shadow-sm border-0 position-relative ${!isAvailable ? 'bg-light' : ''}`} 
                style={{ transition: 'all 0.3s', borderRadius: '12px' }}
              >
                
                {issueStatus.id === book._id && issueStatus.type === "success" && (
                  <div 
                    className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-95" 
                    style={{ zIndex: 10, top: 0, left: 0, borderRadius: '12px' }}
                  >
                    <FaCheckCircle className="text-success mb-2" size={36} />
                    <div className="fw-bold text-success px-3 text-center" style={{fontSize: '0.9rem'}}>
                      {issueStatus.msg}
                    </div>
                  </div>
                )}

                <div className="card-body d-flex flex-column p-4" style={{ minHeight: "200px" }}>
                  <div className="mb-3">
                    <h6 
                      className={`fw-bold mb-1 ${!isAvailable ? 'text-muted' : 'text-dark'}`} 
                      style={{ fontSize: "1rem" }} 
                      title={book.title}
                    >
                      {book.title}
                    </h6>
                    <div className="text-primary fw-bold" style={{fontSize: '0.9rem'}}>
                      by {book.author}
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-muted" style={{fontSize: '0.8rem'}}>
                        <FaMapMarkerAlt className="me-1 text-primary"/>{book.location}
                      </small>
                      <span 
                        className={`fw-bold rounded-pill px-3 py-1 
                          ${isAvailable ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`} 
                        style={{fontSize: '0.75rem'}}
                      >
                        {isAvailable ? `${book.availableCopies} Left` : '0 Left'}
                      </span>
                    </div>

                    {user?.role === 'admin' && (
                      <div style={{minHeight: '38px'}}>
                        {issuingBookId === book._id ? (
                          <div className="input-group input-group-sm">
                            <input 
                              type="number" 
                              className="form-control border-primary" 
                              placeholder="Roll#" 
                              autoFocus 
                              value={rollNoInput}
                              onChange={(e) => setRollNoInput(e.target.value)}
                            />
                            <button 
                              className="btn btn-primary px-2" 
                              onClick={() => submitIssue(book._id)}
                            >
                              <FaCheck size={12}/>
                            </button>
                            <button 
                              className="btn btn-outline-danger px-2" 
                              onClick={() => {setIssuingBookId(null); setRollNoInput("");}}
                            >
                              <FaTimes size={12}/>
                            </button>
                          </div>
                        ) : (
                          <button 
                            className={`btn btn-sm w-100 fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-2 
                              ${isAvailable ? 'btn-primary' : 'btn-secondary disabled'}`}
                            onClick={() => isAvailable && setIssuingBookId(book._id)}
                            disabled={!isAvailable}
                            style={{fontSize: '0.8rem'}}
                          >
                            {isAvailable 
                              ? <><FaBookReader size={14}/> Issue</> 
                              : <><FaExclamationTriangle size={14}/> Empty</>
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
    </div>
  );
};

export default LibraryHome;
