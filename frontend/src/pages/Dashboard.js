import React, { useState, useEffect } from 'react';
import ProgressBar from '../components/ProgressBar';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [userStats, setUserStats] = useState({
    username: '',
    totalScore: 0,
    solvedCount: 0,
    totalProblems: 0,
    progressPercentage: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const res = await api.get('/progress/user');
      setUserStats(res.data.user);
      setRecentActivity(res.data.user.solvedProblems.slice(-5));
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome back, {userStats.username}!</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Score</h3>
          <p className="stat-number">{userStats.totalScore}</p>
        </div>
        <div className="stat-card">
          <h3>Problems Solved</h3>
          <p className="stat-number">{userStats.solvedCount}</p>
        </div>
        <div className="stat-card">
          <h3>Total Problems</h3>
          <p className="stat-number">{userStats.totalProblems}</p>
        </div>
        <div className="stat-card">
          <h3>Progress</h3>
          <ProgressBar 
            progress={userStats.progressPercentage} 
            height="20px"
          />
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-title">{activity.problemId.title}</span>
                <span className="activity-difficulty">{activity.problemId.difficulty}</span>
                <span className="activity-points">{activity.problemId.points} pts</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent activity. Start solving problems!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
