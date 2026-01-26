import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LibraryHome from './LibraryHome';
import LibraryAdmin from './LibraryAdmin';
import AddBook from '../components/AddBook';
import { FaSearch, FaClipboardList, FaPlusSquare, FaBookReader } from 'react-icons/fa';

const LibraryDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('search');

  const tabStyle = (isActive) => ({
    cursor: 'pointer',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? 'white' : '#64748b',
    fontWeight: '600',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            <FaBookReader className="text-primary me-2" />
            Library Hub
          </h4>
          <p className="text-muted small mb-0">
            {user?.role === 'admin' 
              ? "Manage school inventory and track book circulations." 
              : "Find resources using our AI-powered semantic search."}
          </p>
        </div>
      </div>

      {/* --- ROLE-BASED NAVIGATION --- */}
      <div className="d-flex gap-2 mb-3 p-2 bg-white rounded border shadow-sm w-fit-content">
        <button 
          style={tabStyle(activeTab === 'search')} 
          onClick={() => setActiveTab('search')}
        >
          <FaSearch size={14} /> Smart Search
        </button>

        {user?.role === 'admin' && (
          <>
            <button 
              style={tabStyle(activeTab === 'manage')} 
              onClick={() => setActiveTab('manage')}
            >
              <FaClipboardList size={14} /> Transactions
            </button>

            <button 
              style={tabStyle(activeTab === 'add')} 
              onClick={() => setActiveTab('add')}
            >
              <FaPlusSquare size={14} /> Add New Book
            </button>
          </>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="animate-bottom">
        {activeTab === 'search' && (
          <div className="bg-white p-2 p-md-3 rounded border shadow-sm">
            <LibraryHome />
          </div>
        )}

        {activeTab === 'manage' && user?.role === 'admin' && (
          <div className="bg-white p-3 rounded border shadow-sm">
            <LibraryAdmin />
          </div>
        )}

        {activeTab === 'add' && user?.role === 'admin' && (
          <div className="d-flex justify-content-center">
            <div
              className="bg-white p-4 rounded border shadow-sm w-100"
              style={{ maxWidth: "700px" }}
            >
              <AddBook />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryDashboard;
