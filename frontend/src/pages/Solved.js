import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Solved.css';

const Solved = () => {
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, problemsRes] = await Promise.all([
        api.get('/progress/user'),
        api.get('/problems')
      ]);

      const solvedIds = userRes.data.solvedProblems.map(sp => sp.problemId);
      const allProblemsData = problemsRes.data;
      
      const solvedProblemsWithDetails = allProblemsData.filter(problem => 
        solvedIds.includes(problem._id)
      );
      
      setAllProblems(allProblemsData);
      setSolvedProblems(solvedProblemsWithDetails);
      
      const newStats = {
        easy: solvedProblemsWithDetails.filter(p => p.difficulty === 'Easy').length,
        medium: solvedProblemsWithDetails.filter(p => p.difficulty === 'Medium').length,
        hard: solvedProblemsWithDetails.filter(p => p.difficulty === 'Hard').length,
        total: solvedProblemsWithDetails.length
      };
      setStats(newStats);
      
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsolve = async (problemId) => {
    try {
      const res = await api.post('/progress/unsolve', { problemId });
      
      if (res.status === 200) {
        // Remove from solved problems
        setSolvedProblems(prev => prev.filter(p => p._id !== problemId));
        
        // Update stats
        const problem = solvedProblems.find(p => p._id === problemId);
        if (problem) {
          setStats(prev => ({
            ...prev,
            [problem.difficulty.toLowerCase()]: prev[problem.difficulty.toLowerCase()] - 1,
            total: prev.total - 1
          }));
        }
        
        alert('Problem unmarked as solved! ✅');
      }
    } catch (err) {
      console.error('Error unsolving problem:', err);
      alert('Error updating solve status. Please try again.');
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      Easy: { emoji: '🟢', class: 'easy' },
      Medium: { emoji: '🟡', class: 'medium' },
      Hard: { emoji: '🔴', class: 'hard' }
    };
    return badges[difficulty] || { emoji: '⚪', class: 'unknown' };
  };

  const filteredProblems = solvedProblems.filter(problem => {
    if (filter === 'all') return true;
    return problem.difficulty.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="solved">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="solved">
      <div className="solved-header">
        <h1>Solved Problems</h1>
        <div className="achievement-banner">
          <div className="achievement-icon">🏆</div>
          <div className="achievement-text">
            <span className="achievement-count">{stats.total}</span>
            <span className="achievement-label">Problems Conquered</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total-stat">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Solved</div>
          </div>
          <div className="stat-glow"></div>
        </div>
        
        <div className="stat-card easy-stat">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-number">{stats.easy}</div>
            <div className="stat-label">Easy</div>
          </div>
          <div className="stat-glow"></div>
        </div>
        
        <div className="stat-card medium-stat">
          <div className="stat-icon">🟡</div>
          <div className="stat-content">
            <div className="stat-number">{stats.medium}</div>
            <div className="stat-label">Medium</div>
          </div>
          <div className="stat-glow"></div>
        </div>
        
        <div className="stat-card hard-stat">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <div className="stat-number">{stats.hard}</div>
            <div className="stat-label">Hard</div>
          </div>
          <div className="stat-glow"></div>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="filter-icon">🌟</span>
            All ({stats.total})
          </button>
          <button 
            className={`filter-btn ${filter === 'easy' ? 'active' : ''}`}
            onClick={() => setFilter('easy')}
          >
            <span className="filter-icon">🟢</span>
            Easy ({stats.easy})
          </button>
          <button 
            className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            <span className="filter-icon">🟡</span>
            Medium ({stats.medium})
          </button>
          <button 
            className={`filter-btn ${filter === 'hard' ? 'active' : ''}`}
            onClick={() => setFilter('hard')}
          >
            <span className="filter-icon">🔴</span>
            Hard ({stats.hard})
          </button>
        </div>
      )}

      <div className="solved-content">
        {stats.total === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No Victories Yet!</h3>
            <p>Start your coding journey and conquer some problems to see your achievements here.</p>
            <div className="motivational-quote">
              "Every expert was once a beginner. Every pro was once an amateur."
            </div>
          </div>
        ) : (
          <div className="problems-grid">
            {filteredProblems.map((problem, index) => {
              const difficultyInfo = getDifficultyBadge(problem.difficulty);
              return (
                <div key={problem._id} className={`problem-card ${difficultyInfo.class}`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="problem-header">
                    <div className="problem-checkbox">
                      <input
                        type="checkbox"
                        id={`solved-${problem._id}`}
                        checked={true}
                        onChange={() => handleUnsolve(problem._id)}
                      />
                      <label htmlFor={`solved-${problem._id}`} className="checkbox-label">
                        <span className="checkmark">✓</span>
                      </label>
                    </div>
                    <div className="problem-badges">
                      <span className={`difficulty-badge ${difficultyInfo.class}`}>
                        {difficultyInfo.emoji} {problem.difficulty}
                      </span>
                      <span className="points-badge">
                        ⭐ {problem.points}
                      </span>
                    </div>
                  </div>
                  
                  <div className="problem-body">
                    <h3 className="problem-title">{problem.title}</h3>
                    <div className="problem-meta">
                      <span className="category">{problem.category || 'General'}</span>
                    </div>
                  </div>
                  
                  <div className="problem-footer">
                    {problem.problemLink ? (
                      <a 
                        href={problem.problemLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="problem-link"
                      >
                        <span>View Problem</span>
                        <span className="link-arrow">→</span>
                      </a>
                    ) : (
                      <span className="no-link">No Link Available</span>
                    )}
                  </div>
                  
                  <div className="problem-glow"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Solved;
