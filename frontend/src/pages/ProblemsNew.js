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
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    fetchProblems();
    fetchSolvedProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, filters]);

  useEffect(() => {
    setSolvedCount(solvedProblems.length);
  }, [solvedProblems]);

  const fetchProblems = async () => {
    try {
      const res = await api.get('/problems');
      setProblems(res.data);
      setFilteredProblems(res.data);
    } catch (err) {
      console.error('Error fetching problems:', err);
      alert('Error loading problems. Please try again.');
    }
  };

  const fetchSolvedProblems = async () => {
    try {
      const res = await api.get('/progress/user');
      setSolvedProblems(res.data.solvedProblems.map(sp => sp.problemId));
    } catch (err) {
      console.error('Error fetching solved problems:', err);
    }
    setLoading(false);
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

  const getDifficultyDisplay = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '🟢 Easy';
      case 'Medium': return '🟡 Medium';
      case 'Hard': return '🔴 Hard';
      default: return difficulty;
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
      <div className="problems-header">
        <h1>Coding Problems</h1>
        <div className="problems-stats">
          <span className="solved-counter">
            Solved: <strong>{solvedCount}</strong> / {problems.length}
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
          filteredProblems.map(problem => (
            <div key={problem._id} className={`problem-item ${isProblemSolved(problem._id) ? 'solved' : ''}`}>
              <div className="problem-checkbox">
                <input
                  type="checkbox"
                  id={`problem-${problem._id}`}
                  checked={isProblemSolved(problem._id)}
                  onChange={() => handleSolveToggle(problem._id)}
                />
                <label htmlFor={`problem-${problem._id}`}></label>
              </div>
              
              <div className="problem-content">
                <div className="problem-info">
                  <h3 className={`problem-title ${isProblemSolved(problem._id) ? 'strikethrough' : ''}`}>
                    {problem.title}
                  </h3>
                  <div className="problem-meta">
                    <span className="difficulty-badge">
                      {getDifficultyDisplay(problem.difficulty)}
                    </span>
                    <span className="category-badge">{problem.category}</span>
                    <span className="points-badge">{problem.points} pts</span>
                  </div>
                </div>
                
                <div className="problem-actions">
                  {problem.problemLink ? (
                    <a 
                      href={problem.problemLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="solve-link"
                    >
                      Solve Problem →
                    </a>
                  ) : (
                    <span className="no-link">Link Not Available</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Problems;
