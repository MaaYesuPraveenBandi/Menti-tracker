import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Solved.css';

const Solved = () => {
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user's solved problems
      const userRes = await api.get('/progress/user');
      const solvedIds = userRes.data.solvedProblems.map(sp => sp.problemId);
      
      // Fetch all problems to get details
      const problemsRes = await api.get('/problems');
      const allProblemsData = problemsRes.data;
      
      // Filter solved problems with full details
      const solvedProblemsWithDetails = allProblemsData.filter(problem => 
        solvedIds.includes(problem._id)
      );
      
      setAllProblems(allProblemsData);
      setSolvedProblems(solvedProblemsWithDetails);
      
      // Calculate stats
      const stats = {
        easy: solvedProblemsWithDetails.filter(p => p.difficulty === 'Easy').length,
        medium: solvedProblemsWithDetails.filter(p => p.difficulty === 'Medium').length,
        hard: solvedProblemsWithDetails.filter(p => p.difficulty === 'Hard').length,
        total: solvedProblemsWithDetails.length
      };
      setStats(stats);
      
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
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

  const getDifficultyDisplay = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '🟢 Easy';
      case 'Medium': return '🟡 Medium';
      case 'Hard': return '🔴 Hard';
      default: return difficulty;
    }
  };

  if (loading) {
    return <div className="loading">Loading solved problems...</div>;
  }

  return (
    <div className="solved">
      <div className="solved-header">
        <h1>Solved Problems</h1>
        <div className="solved-summary">
          <div className="stat-card total">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Solved</span>
          </div>
          <div className="stat-card easy">
            <span className="stat-number">{stats.easy}</span>
            <span className="stat-label">🟢 Easy</span>
          </div>
          <div className="stat-card medium">
            <span className="stat-number">{stats.medium}</span>
            <span className="stat-label">🟡 Medium</span>
          </div>
          <div className="stat-card hard">
            <span className="stat-number">{stats.hard}</span>
            <span className="stat-label">🔴 Hard</span>
          </div>
        </div>
      </div>

      <div className="solved-content">
        {solvedProblems.length === 0 ? (
          <div className="no-solved">
            <h3>No problems solved yet</h3>
            <p>Start solving problems to see them here!</p>
          </div>
        ) : (
          <div className="solved-list">
            {solvedProblems.map(problem => (
              <div key={problem._id} className="solved-item">
                <div className="solved-checkbox">
                  <input
                    type="checkbox"
                    id={`solved-${problem._id}`}
                    checked={true}
                    onChange={() => handleUnsolve(problem._id)}
                  />
                  <label htmlFor={`solved-${problem._id}`}></label>
                </div>
                
                <div className="solved-content-area">
                  <div className="solved-info">
                    <h3 className="solved-title">{problem.title}</h3>
                    <div className="solved-meta">
                      <span className="difficulty-badge">
                        {getDifficultyDisplay(problem.difficulty)}
                      </span>
                      <span className="category-badge">{problem.category}</span>
                      <span className="points-badge">{problem.points} pts</span>
                    </div>
                  </div>
                  
                  <div className="solved-actions">
                    {problem.problemLink ? (
                      <a 
                        href={problem.problemLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-link"
                      >
                        View Problem →
                      </a>
                    ) : (
                      <span className="no-link">Link Not Available</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Solved;
