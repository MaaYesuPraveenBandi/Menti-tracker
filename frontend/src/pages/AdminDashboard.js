import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProblems: 0,
    totalUsers: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch problems stats
      const problemsRes = await api.get('/problems');
      const problems = problemsRes.data;

      setStats({
        totalProblems: problems.length,
        easyProblems: problems.filter(p => p.difficulty === 'Easy').length,
        mediumProblems: problems.filter(p => p.difficulty === 'Medium').length,
        hardProblems: problems.filter(p => p.difficulty === 'Hard').length,
        totalUsers: 25, // Mock data for now
        recentActivity: problems.slice(0, 5) // Latest 5 problems
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the Mentiby Tracker Admin Panel</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card primary">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.totalProblems}</h3>
            <p>Total Problems</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>{stats.easyProblems}</h3>
            <p>Easy Problems</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🟡</div>
          <div className="stat-content">
            <h3>{stats.mediumProblems}</h3>
            <p>Medium Problems</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <h3>{stats.hardProblems}</h3>
            <p>Hard Problems</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-card">
          <h3>🔧 Manage Problems</h3>
          <p>Add, edit, or delete coding problems</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/admin/problems')}
          >
            Manage Problems
          </button>
        </div>

        <div className="action-card">
          <h3>🔍 Find User</h3>
          <p>Search for a user and view their profile</p>
          <button 
            className="btn-info"
            onClick={() => navigate('/admin/find-user')}
          >
            Find User
          </button>
        </div>

        <div className="action-card">
          <h3>➕ Add New Problem</h3>
          <p>Create a new coding problem with platform link</p>
          <button 
            className="btn-success"
            onClick={() => navigate('/admin/problems/new')}
          >
            Add Problem
          </button>
        </div>

        <div className="action-card">
          <h3>👥 View Students</h3>
          <p>Monitor student progress and activity</p>
          <button 
            className="btn-info"
            onClick={() => navigate('/leaderboard')}
          >
            View Leaderboard
          </button>
        </div>
      </div>

      <div className="recent-activity">
        <h3>📚 Recent Problems</h3>
        <div className="activity-list">
          {stats.recentActivity.map(problem => (
            <div key={problem._id} className="activity-item">
              <div className="problem-header">
                <div className="problem-title-section">
                  <h4 className="problem-title">{problem.title}</h4>
                  <div className="problem-badges">
                    <span className={`difficulty-badge difficulty-${problem.difficulty.toLowerCase()}`}>
                      {problem.difficulty}
                    </span>
                    <span className="category-badge">
                      {problem.category}
                    </span>
                  </div>
                </div>
                <div className="problem-actions">
                  <div className="points-display">
                    <span className="points-icon">🏆</span>
                    <span className="points-value">{problem.points}</span>
                    <span className="points-text">points</span>
                  </div>
                  <button 
                    className="edit-btn"
                    onClick={() => navigate(`/admin/problems/edit/${problem._id}`)}
                    title="Edit Problem"
                  >
                    <span className="edit-icon">✏️</span>
                    <span className="edit-text">Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {stats.recentActivity.length === 0 && (
            <div className="no-activity">
              <p>No problems created yet. Start by adding your first problem!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;