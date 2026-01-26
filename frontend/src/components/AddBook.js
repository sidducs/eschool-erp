import React, { useState } from 'react';
import api from "../services/api"; // ✅ Using your configured API service

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '', 
    author: '', 
    isbn: '', 
    description: '', 
    category: '', 
    totalCopies: 1, 
    location: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Sending to Port 5000 via api service
      await api.post('/api/library/add', formData);
      alert("Book Added Successfully & AI Indexed!");
      // Reset form after success
      setFormData({ title: '', author: '', isbn: '', description: '', category: '', totalCopies: 1, location: '' });
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 bg-white rounded shadow-sm border">
      <h4 className="fw-bold mb-4 text-primary">➕ Add New Library Book</h4>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="small fw-bold text-muted">BOOK TITLE</label>
            <input type="text" name="title" value={formData.title} className="form-control" placeholder="e.g. Intro to Physics" onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="small fw-bold text-muted">AUTHOR</label>
            <input type="text" name="author" value={formData.author} className="form-control" placeholder="e.g. Stephen Hawking" onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="small fw-bold text-muted">ISBN NUMBER (REQUIRED)</label>
            <input type="text" name="isbn" value={formData.isbn} className="form-control" placeholder="e.g. 978-3-16-148410-0" onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="small fw-bold text-muted">CATEGORY</label>
            <input type="text" name="category" value={formData.category} className="form-control" placeholder="e.g. Science" onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="small fw-bold text-muted">TOTAL COPIES</label>
            <input type="number" name="totalCopies" value={formData.totalCopies} className="form-control" min="1" onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="small fw-bold text-muted">SHELF LOCATION</label>
            <input type="text" name="location" value={formData.location} className="form-control" placeholder="e.g. A-12" onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="small fw-bold text-muted">DESCRIPTION (FOR AI SEMANTIC SEARCH)</label>
            <textarea name="description" value={formData.description} className="form-control" rows="3" placeholder="Explain what the book is about..." onChange={handleChange} required></textarea>
            <small className="text-info mt-1 d-block">AI uses this description to help students find the book via Smart Search.</small>
          </div>
          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm">Save to Library Inventory</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBook;