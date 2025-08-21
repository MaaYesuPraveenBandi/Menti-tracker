import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Solved.css';

const Solved = () => {
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSolvedProblems();
    fetchStats();
  }, []);

  const fetchSolvedProblems = async () => {
    try {
      const res = await api.get('/progress/user');
      setSolvedProblems(res.data.user.solvedProblems);
    } catch (err) {
      console.error('Error fetching solved problems:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/progress/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
    setLoading(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#757575';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading solved problems...</div>;
  }

  return (
    <div className="solved">
      <h1>Solved Problems</h1>
      
      <div className="stats-summary">
        <div className="stat-item easy">
          <span className="count">{stats.easy}</span>
          <span className="label">Easy</span>
        </div>
        <div className="stat-item medium">
          <span className="count">{stats.medium}</span>
          <span className="label">Medium</span>
        </div>
        <div className="stat-item hard">
          <span className="count">{stats.hard}</span>
          <span className="label">Hard</span>
        </div>
        <div className="stat-item total">
          <span className="count">{solvedProblems.length}</span>
          <span className="label">Total</span>
        </div>
      </div>

      <div className="solved-list">
        {solvedProblems.length > 0 ? (
          solvedProblems.map((solved, index) => (
            <div key={index} className="solved-item">
              <div className="problem-info">
                <h3>{solved.problemId.title}</h3>
                <span 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(solved.problemId.difficulty) }}
                >
                  {solved.problemId.difficulty}
                </span>
              </div>
              <div className="problem-meta">
                <span className="category">{solved.problemId.category}</span>
                <span className="points">{solved.problemId.points} pts</span>
                <span className="solved-date">Solved on {formatDate(solved.solvedAt)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>You haven't solved any problems yet.</p>
            <p>Start solving problems to see them here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Solved;
