import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Problems.css';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'All',
    category: 'All'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
    fetchSolvedProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, filters]);

  const fetchProblems = async () => {
    try {
      const res = await api.get('/problems');
      setProblems(res.data);
      setFilteredProblems(res.data);
    } catch (err) {
      console.error('Error fetching problems:', err);
    }
    setLoading(false);
  };

  const fetchSolvedProblems = async () => {
    try {
      const res = await api.get('/progress/user');
      setSolvedProblems(res.data.user.solvedProblems.map(sp => sp.problemId._id));
    } catch (err) {
      console.error('Error fetching solved problems:', err);
    }
  };

  const filterProblems = () => {
    let filtered = problems;

    if (filters.difficulty !== 'All') {
      filtered = filtered.filter(problem => problem.difficulty === filters.difficulty);
    }

    if (filters.category !== 'All') {
      filtered = filtered.filter(problem => problem.category === filters.category);
    }

    setFilteredProblems(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getDifficultyDisplay = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '🟢 Easy';
      case 'Medium': return '🟡 Medium';
      case 'Hard': return '🔴 Hard';
      default: return difficulty;
    }
  };

  const handleSolveToggle = async (problemId) => {
    try {
      const isSolved = solvedProblems.includes(problemId);
      
      if (isSolved) {
        // Unsolve the problem
        const res = await api.post('/progress/unsolve', { problemId });
        
        if (res.status === 200) {
          setSolvedProblems(prev => prev.filter(id => id !== problemId));
          alert('Problem unmarked as solved! ✅');
        }
      } else {
        // Solve the problem
        const res = await api.post('/progress/solve', { problemId });
        
        if (res.status === 200) {
          setSolvedProblems(prev => [...prev, problemId]);
          alert('Problem marked as solved! 🎉');
        }
      }
    } catch (err) {
      if (err.response?.data?.msg) {
        alert(err.response.data.msg);
      } else {
        console.error('Error toggling solve status:', err);
        alert('Error updating solve status. Please try again.');
      }
    }
  };

  const isProblemSolved = (problemId) => {
    return solvedProblems.includes(problemId);
  };

  if (loading) {
    return <div className="loading">Loading problems...</div>;
  }

  return (
    <div className="problems">
      <h1>Problems</h1>
      
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
            <option value="All">All</option>
            <option value="Array">Array</option>
            <option value="String">String</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
            <option value="Graph">Graph</option>
            <option value="Tree">Tree</option>
          </select>
        </div>
      </div>

      <div className="problems-list">
        {filteredProblems.map(problem => (
          <div key={problem._id} className={`problem-card ${isProblemSolved(problem._id) ? 'solved' : ''}`}>
            <div className="problem-header">
              <div className="problem-title-section">
                <h3>{problem.title}</h3>
                <div className="solved-checkbox">
                  {!isProblemSolved(problem._id) ? (
                    <>
                      <input
                        type="checkbox"
                        id={`solved-${problem._id}`}
                        checked={false}
                        onChange={() => handleSolveToggle(problem._id)}
                      />
                      <label htmlFor={`solved-${problem._id}`}>
                        ⭕ Mark as Solved
                      </label>
                    </>
                  ) : (
                    <span 
                      className="solved-indicator clickable"
                      onClick={() => handleSolveToggle(problem._id)}
                      title="Click to unmark as solved"
                    >
                      ✅ Solved (Click to unmark)
                    </span>
                  )}
                </div>
              </div>
              <span className="difficulty-badge">
                {getDifficultyDisplay(problem.difficulty)}
              </span>
            </div>
            <p className="problem-description">{problem.description}</p>
            <div className="problem-meta">
              <span className="category">{problem.category}</span>
              <span className="points">{problem.points} points</span>
              <span className="solved-count">{problem.solvedBy?.length || 0} solved</span>
            </div>
            <div className="problem-tags">
              {problem.tags?.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <button 
              className="solve-btn"
              onClick={() => window.open(problem.problemLink, '_blank')}
              disabled={!problem.problemLink}
            >
              {problem.problemLink ? 'Solve Problem' : 'Link Not Available'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Problems;
