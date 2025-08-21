import React, { useState, useEffect } from 'react';
import ProgressBar from '../components/ProgressBar';
import api from '../utils/api';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [userRes, progressRes, statsRes] = await Promise.all([
        api.get('/auth/user'),
        api.get('/progress/user'),
        api.get('/progress/stats')
      ]);
      
      setUser(userRes.data);
      setUserProgress(progressRes.data.user);
      setStats(statsRes.data);
      setEditForm({
        username: userRes.data.username,
        email: userRes.data.email
      });
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      // API call to update user profile would go here
      setIsEditing(false);
      // Update local user state with new data
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile">
      <h1>Profile</h1>
      
      <div className="profile-content">
        <div className="profile-info">
          <div className="avatar">
            <div className="avatar-circle">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="user-details">
            {isEditing ? (
              <div className="edit-form">
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                />
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
                <div className="edit-actions">
                  <button onClick={handleSave}>Save</button>
                  <button onClick={handleEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="view-details">
                <h2>{user?.username}</h2>
                <p>{user?.email}</p>
                <button onClick={handleEdit}>Edit Profile</button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-section">
            <h3>Overview</h3>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-value">{userProgress?.totalScore || 0}</span>
                <span className="stat-label">Total Score</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{userProgress?.solvedCount || 0}</span>
                <span className="stat-label">Problems Solved</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{userProgress?.progressPercentage || 0}%</span>
                <span className="stat-label">Progress</span>
              </div>
            </div>
          </div>

          <div className="stat-section">
            <h3>Progress</h3>
            <ProgressBar 
              progress={userProgress?.progressPercentage || 0} 
              height="25px"
            />
            <p>{userProgress?.solvedCount || 0} of {userProgress?.totalProblems || 0} problems solved</p>
          </div>

          <div className="stat-section">
            <h3>Problems by Difficulty</h3>
            <div className="difficulty-stats">
              <div className="difficulty-item easy">
                <span className="difficulty-count">{stats.easy}</span>
                <span className="difficulty-label">Easy</span>
              </div>
              <div className="difficulty-item medium">
                <span className="difficulty-count">{stats.medium}</span>
                <span className="difficulty-label">Medium</span>
              </div>
              <div className="difficulty-item hard">
                <span className="difficulty-count">{stats.hard}</span>
                <span className="difficulty-label">Hard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
