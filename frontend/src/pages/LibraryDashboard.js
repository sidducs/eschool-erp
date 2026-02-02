import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LibraryHome from './LibraryHome';
import LibraryAdmin from './LibraryAdmin';
import AddBook from '../components/AddBook';
import { FaSearch, FaClipboardList, FaPlusSquare, FaBookReader } from 'react-icons/fa';

const LibraryDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="animate-fadeIn w-full">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FaBookReader className="text-blue-600" />
            Library Hub
          </h4>
        </div>
      </div>

      {/* --- ROLE-BASED NAVIGATION --- */}
      <div className="flex gap-2 mb-6 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'search'
            ? "bg-blue-600 text-white shadow-md"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
        >
          <FaSearch /> Smart Search
        </button>

        {user?.role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'manage'
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
            >
              <FaClipboardList /> Transactions
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'add'
                ? "bg-green-600 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
            >
              <FaPlusSquare /> Add New Book
            </button>
          </>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      <div>
        {activeTab === 'search' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <LibraryHome />
          </div>
        )}

        {activeTab === 'manage' && user?.role === 'admin' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <LibraryAdmin />
          </div>
        )}

        {activeTab === 'add' && user?.role === 'admin' && (
          <div className="flex justify-center">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm w-full max-w-3xl">
              <AddBook />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryDashboard;
