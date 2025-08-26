import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [userStats, setUserStats] = useState({
    username: '',
    totalScore: 0,
    solvedCount: 0,
    totalProblems: 0,
    progressPercentage: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        window.location.href = '/login';
        return;
      }
      
      const res = await api.get('/progress/user');
      const userData = res.data.user;
      
      if (!userData) {
        console.error('No user data found in response');
        return;
      }
      
      setUserStats({
        username: userData.username || 'Unknown User',
        totalScore: userData.totalScore || 0,
        solvedCount: userData.solvedCount || 0,
        totalProblems: userData.totalProblems || 0,
        progressPercentage: userData.progressPercentage || 0,
        easySolved: userData.solvedProblems ? userData.solvedProblems.filter(p => p.problemId && p.problemId.difficulty === 'Easy').length : 0,
        mediumSolved: userData.solvedProblems ? userData.solvedProblems.filter(p => p.problemId && p.problemId.difficulty === 'Medium').length : 0,
        hardSolved: userData.solvedProblems ? userData.solvedProblems.filter(p => p.problemId && p.problemId.difficulty === 'Hard').length : 0,
      });
      
      setRecentActivity(userData.solvedProblems ? userData.solvedProblems.slice(-5).reverse() : []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      if (err.response?.status === 401) {
        console.log('Authentication failed, redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    setLoading(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#2ecc71';
      case 'Medium': return '#f39c12';
      case 'Hard': return '#e74c3c';
      default: return '#bdc3c7';
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Welcome back, {userStats.username}!</h1>
      
      <div className="dashboard-grid">
        <div className="progress-card">
          <h2 className="card-title">Target Problems</h2>
          <div className="progress-chart">
            <CircularProgressbar
              value={userStats.solvedCount}
              maxValue={userStats.totalProblems}
              text={`${userStats.solvedCount} / ${userStats.totalProblems}`}
              styles={buildStyles({
                rotation: 0.25,
                strokeLinecap: 'round',
                textSize: '16px',
                pathTransitionDuration: 0.5,
                pathColor: `rgba(46, 204, 113, ${userStats.progressPercentage / 100})`,
                textColor: '#ffffff',
                trailColor: 'rgba(255, 255, 255, 0.1)',
                backgroundColor: '#3e98c7',
              })}
            />
          </div>
          <div className="difficulty-breakdown">
            <div className="difficulty-item">
              <span className="difficulty-label">Easy</span>
              <span className="difficulty-count easy">{userStats.easySolved}</span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Medium</span>
              <span className="difficulty-count medium">{userStats.mediumSolved}</span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Hard</span>
              <span className="difficulty-count hard">{userStats.hardSolved}</span>
            </div>
          </div>
        </div>

        <div className="recent-activity-card">
          <h2 className="card-title">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-title">{activity.problemId.title}</span>
                  <span 
                    className="activity-difficulty"
                    style={{ backgroundColor: getDifficultyColor(activity.problemId.difficulty) }}
                  >
                    {activity.problemId.difficulty}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No recent activity. Start solving problems!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
