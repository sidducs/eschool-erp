import React, { useState } from 'react';
import api from "../services/api";
import { FaPlusCircle, FaBook, FaUser, FaBarcode, FaLayerGroup, FaListAlt, FaMapMarkerAlt } from "react-icons/fa";

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category: '',
    totalCopies: 1,
    location: '',
    pdfUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/library/add', formData);
      alert("Book Added Successfully & AI Indexed!");
      setFormData({ title: '', author: '', isbn: '', description: '', category: '', totalCopies: 1, location: '' });
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-900/20">
          <FaPlusCircle size={20} />
        </div>
        <h4 className="text-xl font-bold text-slate-800">Add New Library Book</h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2"><FaBook /> Book Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
              placeholder="e.g. A Brief History of Time"
              onChange={handleChange}
              required
            />
          </div>

          {/* Author */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2"><FaUser /> Author</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
              placeholder="e.g. Stephen Hawking"
              onChange={handleChange}
              required
            />
          </div>

          {/* ISBN */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2"><FaBarcode /> ISBN Number (Required)</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400 font-mono"
              placeholder="e.g. 978-0553380163"
              onChange={handleChange}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2"><FaLayerGroup /> Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
              placeholder="e.g. Science"
              onChange={handleChange}
            />
          </div>

          {/* Total Copies */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2"><FaListAlt /> Total Copies</label>
            <input
              type="number"
              name="totalCopies"
              value={formData.totalCopies}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
              min="1"
              onChange={handleChange}
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2"><FaMapMarkerAlt /> Shelf Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
              placeholder="e.g. A-12, Row 3"
              onChange={handleChange}
            />
          </div>

          {/* E-Book Link (PDF URL) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1">E-Book Link (PDF URL) - Optional</label>
            <input
              type="url"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-sans"
              placeholder="https://cloudinary.com/..."
              value={formData.pdfUrl}
              onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
            />
          </div>


          {/* PDF URL */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">E-Book Link (PDF/Resource URL) - Optional</label>
            <input
              type="url"
              name="pdfUrl"
              value={formData.pdfUrl}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
              placeholder="https://example.com/book.pdf"
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description (For AI Semantic Search)</label>
            <textarea
              name="description"
              value={formData.description}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
              rows="3"
              placeholder="Explain what the book is about..."
              onChange={handleChange}
              required
            ></textarea>
            <p className="text-xs text-blue-500 mt-2 font-medium flex items-center bg-blue-50 p-2 rounded w-fit">
              <span className="mr-2">ℹ️</span> AI uses this description to help students find this book via Smart Search.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 mt-4"
        >
          {loading ? "Adding to Inventory..." : "Save to Library Inventory"}
        </button>
      </form>
    </div>
  );
};

export default AddBook;