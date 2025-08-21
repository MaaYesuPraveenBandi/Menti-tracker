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
    difficulty: 'Easy',
    points: 10,
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
        difficulty: problem.difficulty,
        points: problem.points,
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
        title: formData.title,
        difficulty: formData.difficulty,
        points: formData.points,
        problemLink: formData.problemLink
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
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
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
              placeholder="Problem score"
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
              placeholder="https://leetcode.com/problems/two-sum/"
            />
            <small className="form-help">
              Link to the actual problem platform (LeetCode, CodeForces, HackerRank, etc.)
            </small>
          </div>
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
