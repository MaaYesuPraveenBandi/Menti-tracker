import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import './ProblemForm_new.css';

const ProblemForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    category: '',
    points: 10,
    constraints: '',
    tags: '',
    problemLink: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchProblem();
    }
  }, [id, isEdit]);

  const fetchProblem = async () => {
    try {
      const res = await api.get(`/problems/${id}`);
      const problem = res.data;
      
      setFormData({
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        category: problem.category,
        points: problem.points,
        constraints: problem.constraints || '',
        tags: problem.tags ? problem.tags.join(', ') : '',
        problemLink: problem.problemLink || ''
      });
    } catch (err) {
      console.error('Error fetching problem:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const problemData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (isEdit) {
        await api.put(`/admin/problems/${id}`, problemData);
        alert('Problem updated successfully!');
      } else {
        await api.post('/admin/problems', problemData);
        alert('Problem created successfully!');
      }
      
      navigate('/admin/problems');
    } catch (err) {
      console.error('Error saving problem:', err);
      alert('Failed to save problem. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="problem-form">
      <div className="problem-form-header">
        <h1>{isEdit ? 'Edit Problem' : 'Add New Problem'}</h1>
        <button 
          className="btn-secondary"
          onClick={() => navigate('/admin/problems')}
        >
          Back to Problems
        </button>
      </div>

      <form onSubmit={handleSubmit} className="problem-form-content">
        <div className="form-grid">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Problem title"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              placeholder="e.g., Array, String, Dynamic Programming"
            />
          </div>

          <div className="form-group">
            <label>Difficulty *</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              required
              className="difficulty-select"
            >
              <option value="Easy">🟢 Easy</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Hard">🔴 Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label>Points *</label>
            <input
              type="number"
              name="points"
              value={formData.points}
              onChange={handleInputChange}
              required
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="6"
            placeholder="Detailed problem description..."
          />
        </div>

        <div className="form-group">
          <label>Constraints</label>
          <textarea
            name="constraints"
            value={formData.constraints}
            onChange={handleInputChange}
            rows="3"
            placeholder="Problem constraints (optional)"
          />
        </div>

        <div className="form-group">
          <label>Problem Link *</label>
          <input
            type="url"
            name="problemLink"
            value={formData.problemLink}
            onChange={handleInputChange}
            required
            placeholder="https://leetcode.com/problems/two-sum/ or https://codeforces.com/problem/..."
          />
          <small className="form-help">
            Link to the actual problem platform (LeetCode, CodeForces, HackerRank, etc.)
          </small>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Comma-separated tags (e.g., sorting, binary-search)"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/admin/problems')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Problem' : 'Create Problem')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProblemForm;
