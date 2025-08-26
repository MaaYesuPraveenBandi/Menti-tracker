import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const SolvedProblems = () => {
  const [problems, setProblems] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [progressRes, problemsRes, leaderboardRes] = await Promise.all([
          api.get('/progress/user'),
          api.get('/problems'),
          api.get('/leaderboard')
        ]);
        
        console.log('User Progress Data:', progressRes.data);
        console.log('All Problems:', problemsRes.data);
        console.log('Leaderboard Data:', leaderboardRes.data);
        
        setUserProgress(progressRes.data);
        setProblems(problemsRes.data);
        setLeaderboard(leaderboardRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get solved problems - Fixed logic based on actual data structure
  const solvedProblems = userProgress?.user?.solvedProblems?.map(solvedItem => solvedItem.problemId) || [];

  // Get top performer from leaderboard
  const topPerformer = leaderboard && leaderboard.length > 0 ? leaderboard[0] : null;

  console.log('Solved Problems Count:', solvedProblems.length);
  console.log('Solved Problems:', solvedProblems);
  console.log('Top Performer:', topPerformer);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading your solved problems...</h1>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏆 Solved Problems</h1>
        <p style={styles.subtitle}>You've conquered {solvedProblems.length} problem{solvedProblems.length !== 1 ? 's' : ''}!</p>
        
        {/* Top Performer Section */}
        {topPerformer && (
          <div style={styles.topPerformerSection}>
            <div style={styles.topPerformerTitle}>👑 Current Champion</div>
            <div style={styles.topPerformerInfo}>
              <span style={styles.crownIcon}>👑</span>
              <span style={styles.topPerformerName}>{topPerformer.username}</span>
              <div style={styles.topPerformerStats}>
                <span style={styles.topPerformerScore}>{topPerformer.problemsSolved} problems</span>
                <span style={styles.topPerformerSeparator}>•</span>
                <span style={styles.topPerformerScore}>{topPerformer.totalScore} points</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Dashboard Overview */}
      <div style={styles.dashboardGrid}>
        {/* Progress Overview Card */}
        <div style={styles.dashboardCard}>
          <h3 style={styles.cardTitle}>📊 Progress Overview</h3>
          <div style={styles.progressSection}>
            <div style={styles.progressInfo}>
              <span style={styles.progressText}>Overall Progress</span>
              <span style={styles.progressPercent}>{userProgress?.user?.progressPercentage?.toFixed(1) || 0}%</span>
            </div>
            <div style={styles.progressBarContainer}>
              <div style={{
                ...styles.progressBar,
                width: `${userProgress?.user?.progressPercentage || 0}%`
              }}></div>
            </div>
            <div style={styles.progressStats}>
              <span>{solvedProblems.length} of {userProgress?.user?.totalProblems || 0} problems solved</span>
            </div>
          </div>
        </div>

        {/* Total Score Card */}
        <div style={styles.dashboardCard}>
          <h3 style={styles.cardTitle}>🏆 Total Score</h3>
          <div style={styles.scoreDisplay}>
            <span style={styles.scoreNumber}>{userProgress?.user?.totalScore || 0}</span>
            <span style={styles.scoreLabel}>points earned</span>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div style={styles.dashboardCard}>
          <h3 style={styles.cardTitle}>📈 Difficulty Breakdown</h3>
          <div style={styles.difficultyStats}>
            {getDifficultyBreakdown(solvedProblems).map(item => (
              <div key={item.difficulty} style={styles.difficultyRow}>
                <span style={styles.difficultyLabel}>{item.difficulty}</span>
                <div style={styles.difficultyBarContainer}>
                  <div style={{
                    ...styles.difficultyBar,
                    backgroundColor: getDifficultyColor(item.difficulty),
                    width: `${(item.count / solvedProblems.length) * 100}%`
                  }}></div>
                </div>
                <span style={styles.difficultyCount}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={styles.dashboardCard}>
          <h3 style={styles.cardTitle}>⚡ Recent Activity</h3>
          <div style={styles.recentActivity}>
            {userProgress?.user?.solvedProblems?.slice(-3).reverse().map((solved, index) => (
              <div key={index} style={styles.activityItem}>
                <span style={styles.activityTitle}>{solved.problemId.title}</span>
                <span style={styles.activityDate}>
                  {new Date(solved.solvedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {solvedProblems.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎯</div>
          <h3>No problems solved yet!</h3>
          <p>Start solving problems to see your achievements here.</p>
        </div>
      ) : (
        <div style={styles.problemsGrid}>
          {solvedProblems.map((problem) => (
            <div key={problem._id} style={styles.problemCard}>
              <h3 style={styles.problemTitle}>{problem.title}</h3>
              <div style={styles.problemMeta}>
                <span style={{
                  ...styles.difficultyBadge,
                  backgroundColor: getDifficultyColor(problem.difficulty)
                }}>
                  {problem.difficulty}
                </span>
                <span style={styles.pointsBadge}>
                  ⭐ {problem.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to get difficulty colors
const getDifficultyColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return '#27ae60';
    case 'medium':
      return '#f39c12';
    case 'hard':
      return '#e74c3c';
    default:
      return '#95a5a6';
  }
};

// Helper function to get difficulty breakdown
const getDifficultyBreakdown = (solvedProblems) => {
  const breakdown = { Easy: 0, Medium: 0, Hard: 0 };
  
  solvedProblems.forEach(problem => {
    const difficulty = problem.difficulty;
    if (breakdown[difficulty] !== undefined) {
      breakdown[difficulty]++;
    }
  });
  
  return Object.entries(breakdown).map(([difficulty, count]) => ({
    difficulty,
    count
  }));
};

// Styles object
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  title: {
    color: '#2c3e50',
    fontSize: '2.5rem',
    margin: '0 0 10px 0',
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: '1.2rem',
    margin: 0
  },
  topPerformerSection: {
    marginTop: '15px',
    padding: '15px',
    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 50%, #ff8c00 100%)',
    backgroundSize: '200% 200%',
    borderRadius: '12px',
    border: '2px solid #ff8c00',
    boxShadow: '0 8px 32px rgba(255, 140, 0, 0.3), 0 0 40px rgba(255, 140, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    animation: 'gradientShift 4s ease-in-out infinite',
    '::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
      animation: 'shimmer 3s infinite'
    }
  },
  topPerformerTitle: {
    color: '#2c3e50',
    fontSize: '1rem',
    margin: '0 0 8px 0',
    fontWeight: '600',
    textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
  },
  topPerformerInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  crownIcon: {
    color: '#ffd700',
    fontSize: '1.8rem',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6), 0 2px 4px rgba(255, 140, 0, 0.5)',
    filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
    animation: 'pulse 2s ease-in-out infinite'
  },
  topPerformerName: {
    color: '#2c3e50',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.1)',
    background: 'linear-gradient(45deg, #2c3e50, #34495e, #2c3e50)',
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.5)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
    animation: 'shimmer 3s ease-in-out infinite'
  },
  topPerformerStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '5px'
  },
  topPerformerScore: {
    color: '#2c3e50',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.1)',
    background: 'linear-gradient(45deg, #2c3e50, #34495e, #2c3e50)',
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.5)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
    animation: 'shimmer 3s ease-in-out infinite'
  },
  topPerformerSeparator: {
    color: '#2c3e50',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  dashboardCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 6px rgba(255, 140, 0, 0.1)',
    border: '1px solid #e9ecef',
    transition: 'all 0.3s ease',
    ':hover': {
      borderColor: '#ff8c00',
      boxShadow: '0 6px 12px rgba(255, 140, 0, 0.15)'
    }
  },
  cardTitle: {
    color: '#2c3e50',
    fontSize: '1.2rem',
    margin: '0 0 20px 0',
    fontWeight: '600'
  },
  progressSection: {
    width: '100%'
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  progressText: {
    color: '#7f8c8d',
    fontSize: '0.9rem'
  },
  progressPercent: {
    color: '#2c3e50',
    fontSize: '1.1rem',
    fontWeight: 'bold'
  },
  progressBarContainer: {
    backgroundColor: '#ecf0f1',
    borderRadius: '10px',
    height: '12px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressBar: {
    backgroundColor: '#ff8c00',
    height: '100%',
    borderRadius: '10px',
    transition: 'width 1s ease-in-out'
  },
  progressStats: {
    color: '#7f8c8d',
    fontSize: '0.85rem',
    textAlign: 'center'
  },
  scoreDisplay: {
    textAlign: 'center'
  },
  scoreNumber: {
    display: 'block',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: '5px'
  },
  scoreLabel: {
    color: '#7f8c8d',
    fontSize: '0.9rem'
  },
  difficultyStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  difficultyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  difficultyLabel: {
    minWidth: '60px',
    fontSize: '0.9rem',
    color: '#2c3e50',
    fontWeight: '500'
  },
  difficultyBarContainer: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    borderRadius: '6px',
    height: '8px',
    overflow: 'hidden'
  },
  difficultyBar: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.8s ease-in-out'
  },
  difficultyCount: {
    minWidth: '20px',
    fontSize: '0.9rem',
    color: '#7f8c8d',
    textAlign: 'right'
  },
  recentActivity: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  activityTitle: {
    color: '#2c3e50',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  activityDate: {
    color: '#7f8c8d',
    fontSize: '0.8rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  problemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  problemCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 6px rgba(255, 140, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: '1px solid #e9ecef'
  },
  problemTitle: {
    color: '#2c3e50',
    fontSize: '1.3rem',
    margin: '0 0 20px 0',
    fontWeight: '600',
    lineHeight: '1.4'
  },
  problemMeta: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  difficultyBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'capitalize'
  },
  pointsBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    backgroundColor: '#ff8c00',
    color: 'white',
    boxShadow: '0 2px 8px rgba(255, 140, 0, 0.3), 0 0 20px rgba(255, 140, 0, 0.1)',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#ffa500',
      boxShadow: '0 4px 12px rgba(255, 140, 0, 0.4), 0 0 25px rgba(255, 140, 0, 0.2)',
      transform: 'translateY(-1px)'
    }
  }
};

// Add enhanced animation styles
const enhancedAnimations = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
    }
    50% {
      transform: scale(1.1);
      filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 25px rgba(255, 140, 0, 0.4));
    }
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 8px 32px rgba(255, 140, 0, 0.3), 0 0 40px rgba(255, 140, 0, 0.1);
    }
    50% {
      box-shadow: 0 8px 32px rgba(255, 140, 0, 0.5), 0 0 60px rgba(255, 140, 0, 0.2);
    }
  }
`;

// Inject the enhanced animations into the document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = enhancedAnimations;
  document.head.appendChild(styleSheet);
}

export default SolvedProblems;
