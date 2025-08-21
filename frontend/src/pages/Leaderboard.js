import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard');
      setLeaderboard(res.data);
      
      // Get current user's rank
      const userRes = await api.get('/auth/user');
      if (userRes.data) {
        const rankRes = await api.get(`/leaderboard/user/${userRes.data._id}`);
        setCurrentUserRank(rankRes.data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>
      
      {currentUserRank && (
        <div className="current-user-rank">
          <h3>Your Rank: #{currentUserRank.rank}</h3>
          <p>Score: {currentUserRank.totalScore} | Problems Solved: {currentUserRank.problemsSolved}</p>
        </div>
      )}

      <div className="leaderboard-table">
        <div className="table-header">
          <span>Rank</span>
          <span>Username</span>
          <span>Score</span>
          <span>Problems Solved</span>
        </div>
        
        {leaderboard.map(user => (
          <div key={user.username} className={`table-row ${user.rank <= 3 ? 'top-three' : ''}`}>
            <span className="rank">
              {getRankIcon(user.rank)} #{user.rank}
            </span>
            <span className="username">{user.username}</span>
            <span className="score">{user.totalScore}</span>
            <span className="problems-solved">{user.problemsSolved}</span>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="empty-state">
          <p>No users found. Be the first to solve problems!</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
