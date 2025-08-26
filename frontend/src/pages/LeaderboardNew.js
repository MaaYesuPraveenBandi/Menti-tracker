import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    topXP: 0,
    avgXP: 0
  });

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard');
      setLeaderboard(res.data);
      
      // Calculate statistics
      if (res.data.length > 0) {
        const totalStudents = res.data.length;
        const topXP = Math.max(...res.data.map(user => user.totalScore));
        const avgXP = Math.round(res.data.reduce((sum, user) => sum + user.totalScore, 0) / totalStudents);
        
        setStats({
          totalStudents,
          topXP,
          avgXP
        });
      }
      
      // Get current user's rank
      const userRes = await api.get('/auth/user');
      if (userRes.data) {
        const userRank = res.data.findIndex(user => user.username === userRes.data.username) + 1;
        if (userRank > 0) {
          const userData = res.data[userRank - 1];
          setCurrentUserRank({
            rank: userRank,
            totalScore: userData.totalScore,
            problemsSolved: userData.problemsSolved
          });
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  const getRankCardStyle = (rank) => {
    if (rank === 1) {
      return {
        ...styles.leaderboardCard,
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        border: '2px solid #FFD700',
        boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)',
        transform: 'translateY(-2px)'
      };
    } else if (rank === 2) {
      return {
        ...styles.leaderboardCard,
        background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
        border: '2px solid #C0C0C0',
        boxShadow: '0 6px 20px rgba(192, 192, 192, 0.2)'
      };
    } else if (rank === 3) {
      return {
        ...styles.leaderboardCard,
        background: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
        border: '2px solid #CD7F32',
        boxShadow: '0 6px 20px rgba(205, 127, 50, 0.2)'
      };
    }
    return styles.leaderboardCard;
  };

  const getTextColor = (rank) => {
    if (rank <= 3) return '#000';
    return '#e0e6ed';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>🏆 Student XP Leaderboard</h1>
            <p style={styles.subtitle}>Rankings based on Codedamn platform experience points</p>
            <p style={styles.updateTime}>Updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Total Students</div>
              <div style={styles.statValue}>{stats.totalStudents}</div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👑</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Top XP</div>
              <div style={styles.statValue}>{stats.topXP.toLocaleString()}</div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚡</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Avg XP</div>
              <div style={styles.statValue}>{stats.avgXP}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Header */}
      <div style={styles.tableHeader}>
        <div style={styles.headerCell}>Rank</div>
        <div style={styles.headerCell}>ID</div>
        <div style={styles.headerCell}>Name</div>
        <div style={styles.headerCell}>Cohort</div>
        <div style={styles.headerCell}>Batch</div>
        <div style={styles.headerCell}>XP</div>
      </div>

      {/* Leaderboard Cards */}
      <div style={styles.leaderboardContainer}>
        {leaderboard.map((user, index) => (
          <div key={user.username} style={getRankCardStyle(user.rank)}>
            <div style={styles.rankSection}>
              <div style={{...styles.rankNumber, color: getTextColor(user.rank)}}>
                {user.rank}
              </div>
            </div>
            
            <div style={{...styles.idSection, color: getTextColor(user.rank)}}>
              USER{user.rank.toString().padStart(3, '0')}
            </div>
            
            <div style={styles.userInfo}>
              <div style={{...styles.userName, color: getTextColor(user.rank)}}>
                {user.username}
              </div>
              <div style={{...styles.userEmail, color: getTextColor(user.rank)}}>
                {user.username.toLowerCase()}@example.com
              </div>
            </div>
            
            <div style={styles.cohortBadge}>
              <span style={styles.cohortText}>Basic</span>
            </div>
            
            <div style={{...styles.batchInfo, color: getTextColor(user.rank)}}>
              1.0
            </div>
            
            <div style={styles.xpSection}>
              <div style={styles.xpIcon}>⚡</div>
              <div style={{...styles.xpValue, color: getTextColor(user.rank)}}>
                {user.totalScore.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div style={styles.emptyState}>
          <p>No users found. Be the first to solve problems!</p>
        </div>
      )}
    </div>
  );
};

// Styles object
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0e27',
    color: '#e0e6ed',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0e27'
  },
  loadingText: {
    color: '#e0e6ed',
    fontSize: '1.2rem'
  },
  header: {
    padding: '30px',
    background: 'linear-gradient(135deg, #1e2044 0%, #2d3561 100%)',
    borderBottom: '1px solid #2d3561'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  titleSection: {
    textAlign: 'left',
    marginBottom: '30px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#8892b0',
    margin: '0 0 5px 0'
  },
  updateTime: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  statCard: {
    backgroundColor: '#1e2044',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid #2d3561',
    transition: 'transform 0.2s ease'
  },
  statIcon: {
    fontSize: '2rem'
  },
  statContent: {
    flex: 1
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#8892b0',
    marginBottom: '5px'
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#e0e6ed'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '80px 120px 1fr 120px 80px 100px',
    gap: '20px',
    padding: '20px 30px',
    backgroundColor: '#1e2044',
    borderBottom: '1px solid #2d3561',
    fontWeight: '600',
    fontSize: '0.9rem',
    color: '#8892b0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  headerCell: {
    display: 'flex',
    alignItems: 'center'
  },
  leaderboardContainer: {
    padding: '0 30px 30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  leaderboardCard: {
    display: 'grid',
    gridTemplateColumns: '80px 120px 1fr 120px 80px 100px',
    gap: '20px',
    alignItems: 'center',
    padding: '20px',
    marginBottom: '8px',
    backgroundColor: '#1e2044',
    borderRadius: '12px',
    border: '1px solid #2d3561',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  rankSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankNumber: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  idSection: {
    fontSize: '0.9rem',
    fontWeight: '500',
    opacity: 0.8
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  userName: {
    fontSize: '1.1rem',
    fontWeight: '600'
  },
  userEmail: {
    fontSize: '0.85rem',
    opacity: 0.7
  },
  cohortBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b4779',
    borderRadius: '6px',
    padding: '6px 12px',
    width: 'fit-content'
  },
  cohortText: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#e0e6ed'
  },
  batchInfo: {
    fontSize: '1rem',
    fontWeight: '500',
    textAlign: 'center'
  },
  xpSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  xpIcon: {
    fontSize: '1.2rem'
  },
  xpValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#8892b0'
  }
};

export default Leaderboard;
