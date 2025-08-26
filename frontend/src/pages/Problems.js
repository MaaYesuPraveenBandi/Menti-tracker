import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import './Problems.css';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'All',
    category: 'All'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [problemsRes, progressRes] = await Promise.all([
        api.get('/problems'),
        api.get('/progress/user')
      ]);
      
      setProblems(problemsRes.data);
      setUserProgress(progressRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401) {
        alert('Please log in again');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const solvedProblemIds = useMemo(() => {
    if (!userProgress || !userProgress.user || !userProgress.user.solvedProblems) {
      return new Set();
    }
    
    const ids = new Set(userProgress.user.solvedProblems.map(sp => {
      // Handle populated problemId (object) vs unpopulated (string)
      const id = sp.problemId && sp.problemId._id ? sp.problemId._id : sp.problemId;
      return id;
    }));
    return ids;
  }, [userProgress]);

  const filteredProblems = useMemo(() => {
    if (!problems) return [];
    
    let filtered = problems;

    // Don't filter out solved problems - show all problems with different states
    // filtered = filtered.filter(problem => !solvedProblemIds.has(problem._id));

    if (filters.difficulty !== 'All') {
      filtered = filtered.filter(problem => problem.difficulty === filters.difficulty);
    }

    if (filters.category !== 'All') {
      filtered = filtered.filter(problem => problem.category === filters.category);
    }

    return filtered;
  }, [problems, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSolveToggle = async (problemId) => {
    const isSolved = solvedProblemIds.has(problemId);
    const endpoint = isSolved ? '/progress/unsolve' : '/progress/solve';
    const alertMessage = isSolved ? 'Problem unmarked as solved! ✅' : 'Problem marked as solved! 🎉';

    try {
      const response = await api.post(endpoint, { problemId });
      
      // Refresh data after successful update
      await fetchData();
      
      alert(alertMessage);
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      if (err.response?.data?.msg) {
        alert(err.response.data.msg);
      } else {
        console.error('Error toggling solve status:', err);
        alert('Error updating solve status. Please try again.');
      }
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

  const isProblemSolved = (problemId) => {
    return solvedProblemIds.has(problemId);
  };

  const isLoading = loading;

  if (isLoading) {
    return <div className="loading">Loading problems...</div>;
  }

  if (!problems || !userProgress) {
    return <div className="problems"><div className="no-problems"><p>Error loading problems. Please try again.</p></div></div>;
  }

  return (
    <div className="problems">
      <div className="problems-header">
        <h1>Coding Problems</h1>
        <div className="problems-stats">
          <span className="solved-counter">
            Solved: <strong>{solvedProblemIds.size}</strong> / {problems.length}
          </span>
        </div>
      </div>
      
      <div className="filters">
        <div className="filter-group">
          <label>Difficulty:</label>
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">🟢 Easy</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Hard">🔴 Hard</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Array">Array</option>
            <option value="String">String</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
            <option value="Graph">Graph</option>
            <option value="Tree">Tree</option>
            <option value="Math">Math</option>
            <option value="Greedy">Greedy</option>
            <option value="Backtracking">Backtracking</option>
          </select>
        </div>
      </div>

      <div className="problems-list">
        {filteredProblems.length === 0 ? (
          <div className="no-problems">
            <p>No problems found. {filters.difficulty !== 'All' || filters.category !== 'All' ? 'Try adjusting your filters.' : 'Ask admin to add some problems.'}</p>
          </div>
        ) : (
          filteredProblems.map((problem, index) => {
            const difficultyInfo = getDifficultyBadge(problem.difficulty);
            const isSolved = isProblemSolved(problem._id);
            
            return (
              <div key={problem._id} className={`problem-card ${difficultyInfo.class} ${isSolved ? 'solved-card' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="problem-header">
                  <div className="problem-checkbox">
                    <input
                      type="checkbox"
                      id={`problem-${problem._id}`}
                      checked={isSolved}
                      onChange={() => handleSolveToggle(problem._id)}
                    />
                    <label htmlFor={`problem-${problem._id}`} className="checkbox-label">
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
                      <span>Solve Problem</span>
                      <span className="link-arrow">→</span>
                    </a>
                  ) : (
                    <span className="no-link">No Link Available</span>
                  )}
                </div>
                
                <div className="problem-glow"></div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Problems;
