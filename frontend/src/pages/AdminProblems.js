import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './AdminProblems.css';

const AdminProblems = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await api.get('/admin/problems');
      setProblems(res.data);
    } catch (err) {
      console.error('Error fetching problems:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await api.delete(`/admin/problems/${id}`);
        setProblems(problems.filter(problem => problem._id !== id));
        alert('Problem deleted successfully!');
      } catch (err) {
        console.error('Error deleting problem:', err);
        alert('Failed to delete problem.');
      }
    }
  };

  const getDifficultyDisplay = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '🟢 Easy';
      case 'Medium': return '🟡 Medium';
      case 'Hard': return '🔴 Hard';
      default: return difficulty;
    }
  };

  if (loading) {
    return <div className="loading">Loading problems...</div>;
  }

  return (
    <div className="admin-problems">
      <div className="admin-problems-header">
        <h1>Manage Problems</h1>
        <button 
          className="btn-primary"
          onClick={() => navigate('/admin/problems/new')}
        >
          Add New Problem
        </button>
      </div>

      <div className="problems-stats">
        <div className="stat-card">
          <h3>{problems.length}</h3>
          <p>Total Problems</p>
        </div>
        <div className="stat-card">
          <h3>{problems.filter(p => p.difficulty === 'Easy').length}</h3>
          <p>Easy Problems</p>
        </div>
        <div className="stat-card">
          <h3>{problems.filter(p => p.difficulty === 'Medium').length}</h3>
          <p>Medium Problems</p>
        </div>
        <div className="stat-card">
          <h3>{problems.filter(p => p.difficulty === 'Hard').length}</h3>
          <p>Hard Problems</p>
        </div>
      </div>

      <div className="problems-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Category</th>
              <th>Points</th>
              <th>Platform Link</th>
              <th>Solved By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map(problem => (
              <tr key={problem._id}>
                <td>
                  <div className="problem-title">
                    <strong>{problem.title}</strong>
                    <small>{problem.description?.substring(0, 50)}...</small>
                  </div>
                </td>
                <td>
                  <span className="difficulty-badge">
                    {getDifficultyDisplay(problem.difficulty)}
                  </span>
                </td>
                <td>{problem.category}</td>
                <td>{problem.points}</td>
                <td>
                  {problem.problemLink ? (
                    <a 
                      href={problem.problemLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link-btn"
                    >
                      View Problem
                    </a>
                  ) : (
                    <span className="no-link">No Link</span>
                  )}
                </td>
                <td>{problem.solvedBy?.length || 0}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => navigate(`/admin/problems/edit/${problem._id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(problem._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {problems.length === 0 && (
          <div className="no-problems">
            <h3>No problems found</h3>
            <p>Start by adding your first problem!</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/admin/problems/new')}
            >
              Add New Problem
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProblems;