import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
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
          topXP: topXP,
          avgXP: Math.min(...res.data.map(user => user.totalScore)) // Min score instead of avg
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

  const getRankCardStyle = (rank, isHovered = false) => {
    const baseTransform = isHovered ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)';
    
    if (rank === 1) {
      return {
        ...styles.leaderboardCard,
        background: 'linear-gradient(135deg, #FF8C00 0%, #FFA500 50%, #FF8C00 100%)',
        border: '2px solid #FF8C00',
        boxShadow: isHovered 
          ? '0 15px 40px rgba(255, 140, 0, 0.6), 0 0 30px rgba(255, 140, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          : '0 8px 25px rgba(255, 140, 0, 0.4), 0 0 20px rgba(255, 140, 0, 0.2)',
        transform: baseTransform,
        animation: 'orangeGlow 3s ease-in-out infinite alternate'
      };
    } else if (rank === 2) {
      return {
        ...styles.leaderboardCard,
        background: 'linear-gradient(135deg, #E5E5E5 0%, #C0C0C0 50%, #E5E5E5 100%)',
        border: '2px solid #C0C0C0',
        boxShadow: isHovered 
          ? '0 12px 35px rgba(192, 192, 192, 0.5), 0 0 25px rgba(192, 192, 192, 0.3)'
          : '0 6px 20px rgba(192, 192, 192, 0.3), 0 0 15px rgba(192, 192, 192, 0.1)',
        transform: baseTransform,
        animation: 'silverGlow 4s ease-in-out infinite alternate'
      };
    } else if (rank === 3) {
      return {
        ...styles.leaderboardCard,
        background: 'linear-gradient(135deg, #D4A574 0%, #CD7F32 50%, #D4A574 100%)',
        border: '2px solid #CD7F32',
        boxShadow: isHovered 
          ? '0 12px 35px rgba(205, 127, 50, 0.5), 0 0 25px rgba(205, 127, 50, 0.3)'
          : '0 6px 20px rgba(205, 127, 50, 0.3), 0 0 15px rgba(205, 127, 50, 0.1)',
        transform: baseTransform,
        animation: 'bronzeGlow 5s ease-in-out infinite alternate'
      };
    }
    return {
      ...styles.leaderboardCard,
      transform: baseTransform,
      boxShadow: isHovered 
        ? '0 10px 30px rgba(62, 80, 180, 0.4), 0 0 20px rgba(62, 80, 180, 0.2)'
        : '0 4px 15px rgba(62, 80, 180, 0.2)'
    };
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
            <h1 style={styles.title}>🏆 Student Score Leaderboard</h1>
            <p style={styles.subtitle}>Rankings based on MentiBY DSA sheet solved points</p>
            <p style={styles.updateTime}>Updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard} 
               onMouseEnter={(e) => {
                 e.target.style.transform = 'translateY(-3px)';
                 e.target.style.boxShadow = '0 8px 25px rgba(74, 90, 149, 0.4), 0 0 20px rgba(74, 90, 149, 0.2)';
               }}
               onMouseLeave={(e) => {
                 e.target.style.transform = 'translateY(0)';
                 e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
               }}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Total Students</div>
              <div style={styles.statValue}>{stats.totalStudents}</div>
            </div>
          </div>
          
          <div style={{...styles.statCard, ...styles.goldStatCard}} 
               onMouseEnter={(e) => {
                 e.target.style.transform = 'translateY(-3px)';
                 e.target.style.boxShadow = '0 8px 25px rgba(255, 140, 0, 0.5), 0 0 20px rgba(255, 140, 0, 0.3)';
               }}
               onMouseLeave={(e) => {
                 e.target.style.transform = 'translateY(0)';
                 e.target.style.boxShadow = '0 4px 15px rgba(255, 140, 0, 0.2), 0 0 10px rgba(255, 140, 0, 0.1)';
               }}>
            <div style={styles.statIcon}>👑</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Current Champion</div>
              <div style={{...styles.statValue, color: '#FF8C00'}}>
                {stats.topXP.toLocaleString()}
              </div>
              {leaderboard.length > 0 && (
                <div style={styles.championName}>
                  {leaderboard[0].username}
                </div>
              )}
            </div>
          </div>
          
          <div style={styles.statCard}
               onMouseEnter={(e) => {
                 e.target.style.transform = 'translateY(-3px)';
                 e.target.style.boxShadow = '0 8px 25px rgba(74, 90, 149, 0.4), 0 0 20px rgba(74, 90, 149, 0.2)';
               }}
               onMouseLeave={(e) => {
                 e.target.style.transform = 'translateY(0)';
                 e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
               }}>
            <div style={styles.statIcon}>⚡</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Min Score</div>
              <div style={styles.statValue}>{stats.avgXP}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Header */}
      <div style={styles.tableHeader}>
        <div style={styles.headerCell}>Rank</div>
        <div style={styles.headerCell}>Name</div>
        <div style={styles.headerCell}>Score</div>
      </div>

      {/* Leaderboard Cards */}
      <div style={styles.leaderboardContainer}>
        {leaderboard.map((user, index) => (
          <div 
            key={user.username} 
            style={getRankCardStyle(user.rank, hoveredCard === user.rank)}
            onMouseEnter={() => setHoveredCard(user.rank)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => {
              // Add click animation
              const card = document.getElementById(`card-${user.rank}`);
              if (card) {
                card.style.transform = 'scale(0.98)';
                setTimeout(() => {
                  card.style.transform = hoveredCard === user.rank ? 'translateY(-5px) scale(1.02)' : 'scale(1)';
                }, 150);
              }
            }}
            id={`card-${user.rank}`}
          >
            <div style={styles.rankSection}>
              <div style={{
                ...styles.rankNumber, 
                color: getTextColor(user.rank),
                textShadow: user.rank <= 3 ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                animation: hoveredCard === user.rank ? 'pulse 1.5s ease-in-out infinite' : 'none'
              }}>
                {user.rank}
              </div>
            </div>
            
            <div style={styles.userInfo}>
              <div style={{
                ...styles.userName, 
                color: getTextColor(user.rank),
                textShadow: user.rank <= 3 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
              }}>
                {user.username}
              </div>
            </div>
            
            <div style={styles.xpSection}>
              <div style={{
                ...styles.xpIcon,
                animation: hoveredCard === user.rank ? 'sparkle 1s ease-in-out infinite' : 'none'
              }}>
                ⚡
              </div>
              <div style={{
                ...styles.xpValue, 
                color: getTextColor(user.rank),
                textShadow: user.rank <= 3 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                fontWeight: hoveredCard === user.rank ? '900' : 'bold'
              }}>
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
    fontSize: '1.2rem',
    animation: 'pulse 2s ease-in-out infinite'
  },
  header: {
    padding: '30px',
    background: 'linear-gradient(135deg, #1e2044 0%, #2d3561 100%)',
    borderBottom: '1px solid #2d3561',
    position: 'relative',
    overflow: 'hidden'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    background: 'linear-gradient(45deg, #FF8C00, #FFA500, #FF8C00)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 0 30px rgba(255, 140, 0, 0.5)'
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
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  },
  goldStatCard: {
    background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
    border: '1px solid rgba(255, 140, 0, 0.3)',
    boxShadow: '0 4px 15px rgba(255, 140, 0, 0.2), 0 0 10px rgba(255, 140, 0, 0.1)'
  },
  statIcon: {
    fontSize: '2rem',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
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
    color: '#e0e6ed',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
  },
  championName: {
    color: '#FF8C00',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginTop: '5px',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(45deg, #FF8C00, #FFA500)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 150px',
    gap: '30px',
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
    gridTemplateColumns: '100px 1fr 150px',
    gap: '30px',
    alignItems: 'center',
    padding: '25px 30px',
    marginBottom: '8px',
    backgroundColor: '#1e2044',
    borderRadius: '12px',
    border: '1px solid #2d3561',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  },
  rankSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankNumber: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  idSection: {
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  userName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  userEmail: {
    fontSize: '0.85rem',
    transition: 'all 0.3s ease'
  },
  cohortBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    padding: '6px 12px',
    width: 'fit-content',
    transition: 'all 0.3s ease'
  },
  cohortText: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#e0e6ed'
  },
  batchInfo: {
    fontSize: '1rem',
    fontWeight: '500',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  },
  xpSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  xpIcon: {
    fontSize: '1.2rem',
    transition: 'all 0.3s ease'
  },
  xpValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#8892b0'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
  @keyframes orangeGlow {
    0% { box-shadow: 0 8px 25px rgba(255, 140, 0, 0.4), 0 0 20px rgba(255, 140, 0, 0.2); }
    100% { box-shadow: 0 12px 35px rgba(255, 140, 0, 0.6), 0 0 30px rgba(255, 140, 0, 0.4); }
  }
  
  @keyframes silverGlow {
    0% { box-shadow: 0 6px 20px rgba(192, 192, 192, 0.3), 0 0 15px rgba(192, 192, 192, 0.1); }
    100% { box-shadow: 0 10px 30px rgba(192, 192, 192, 0.5), 0 0 25px rgba(192, 192, 192, 0.3); }
  }
  
  @keyframes bronzeGlow {
    0% { box-shadow: 0 6px 20px rgba(205, 127, 50, 0.3), 0 0 15px rgba(205, 127, 50, 0.1); }
    100% { box-shadow: 0 10px 30px rgba(205, 127, 50, 0.5), 0 0 25px rgba(205, 127, 50, 0.3); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
  
  @keyframes sparkle {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-5deg) scale(1.1); }
    75% { transform: rotate(5deg) scale(1.1); }
  }
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
document.head.appendChild(styleSheet);

export default Leaderboard;
