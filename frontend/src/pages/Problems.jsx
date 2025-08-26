import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Problems.css';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [problemStatus, setProblemStatus] = useState({}); // Track status of each problem
  const [filters, setFilters] = useState({
    difficulty: 'All',
    topic: 'All'
  });
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({}); // For countdown timers
  const [solvedIds, setSolvedIds] = useState([]);

  useEffect(() => {
    fetchProblems();
    // Fetch list of solved problem IDs for current user
    const fetchSolved = async () => {
      try {
        const res = await api.get('/progress/solved-ids');
        setSolvedIds(res.data);
      } catch (err) {
        console.error('Error fetching solved IDs:', err);
      }
    };
    fetchSolved();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, filters]);

  useEffect(() => {
    // Update countdowns every second
    const interval = setInterval(() => {
      setCountdowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(problemId => {
          if (updated[problemId] > 0) {
            updated[problemId] = updated[problemId] - 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await api.get('/problems');
      setProblems(res.data);
      setFilteredProblems(res.data);
      
      // Fetch status for each problem
      const statusPromises = res.data.map(problem => 
        fetchProblemStatus(problem._id)
      );
      await Promise.all(statusPromises);
    } catch (err) {
      console.error('Error fetching problems:', err);
    }
    setLoading(false);
  };

  const fetchProblemStatus = async (problemId) => {
    try {
      const res = await api.get(`/time-progress/status/${problemId}`);
      setProblemStatus(prev => ({
        ...prev,
        [problemId]: res.data
      }));

      // Set countdown if locked
      if (res.data.status === 'locked') {
        setCountdowns(prev => ({
          ...prev,
          [problemId]: res.data.remainingMinutes * 60
        }));
      }
    } catch (err) {
      console.error('Error fetching problem status:', err);
    }
  };

  const filterProblems = () => {
    let filtered = problems;

    if (filters.difficulty !== 'All') {
      filtered = filtered.filter(problem => problem.difficulty === filters.difficulty);
    }

    if (filters.topic !== 'All') {
      filtered = filtered.filter(problem => problem.topic === filters.topic);
    }

    setFilteredProblems(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleStart = async (problemId) => {
    try {
      const res = await api.post('/time-progress/start', { problemId });
      
      if (res.data.earliestCompleteAt) {
        const remainingMs = new Date(res.data.earliestCompleteAt).getTime() - Date.now();
        const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
        
        setCountdowns(prev => ({
          ...prev,
          [problemId]: remainingSeconds
        }));

        setProblemStatus(prev => ({
          ...prev,
          [problemId]: {
            status: 'locked',
            earliestCompleteAt: res.data.earliestCompleteAt,
            remainingMinutes: Math.ceil(remainingMs / 60000)
          }
        }));

        alert(`Timer started! You can complete this problem after ${res.data.recommendedMinutes} minutes.`);
      }
    } catch (err) {
      console.error('Error starting problem:', err);
      alert(err.response?.data?.msg || 'Error starting problem');
    }
  };

  const handleStop = async (problemId) => {
    try {
      await api.post('/time-progress/stop', { problemId });
      alert('Session stopped. You can resume later.');
    } catch (err) {
      console.error('Error stopping problem:', err);
      alert('Error stopping session');
    }
  };

  const handleComplete = async (problemId) => {
    try {
      const res = await api.post('/time-progress/complete', { problemId });
      
      setProblemStatus(prev => ({
        ...prev,
        [problemId]: {
          status: 'completed',
          completion: res.data.completion
        }
      }));

      setCountdowns(prev => {
        const updated = { ...prev };
        delete updated[problemId];
        return updated;
      });

      alert(`🎉 Problem completed! ${res.data.withinRecommended ? 'Within recommended time!' : 'Good effort!'}`);
    } catch (err) {
      console.error('Error completing problem:', err);
      alert(err.response?.data?.msg || 'Error completing problem');
    }
  };

  const handleUnsolve = async (problemId) => {
    try {
      const res = await api.post('/time-progress/unsolve', { problemId });
      
      setProblemStatus(prev => ({
        ...prev,
        [problemId]: {
          status: 'not_started',
          canStart: true
        }
      }));

      alert('Problem unmarked as solved! You can start fresh.');
    } catch (err) {
      console.error('Error unsolving problem:', err);
      alert(err.response?.data?.msg || 'Error unsolving problem');
    }
  };

  const handleSolve = async (pid) => {
    try {
      await api.post('/progress/solve', { problemId: pid });
      setSolvedIds(prev => [...prev, pid]);
    } catch (err) {
      console.error('Error marking solved:', err);
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

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProblemStatusDisplay = (problem) => {
    const status = problemStatus[problem._id];
    const countdown = countdowns[problem._id];

    if (!status) return null;

    switch (status.status) {
      case 'completed':
        return (
          <div 
            className="problem-status completed clickable"
            onClick={() => handleUnsolve(problem._id)}
            title="Click to unmark as solved"
          >
            <span>✅ Completed (Click to unmark)</span>
          </div>
        );
      
      case 'locked':
        return (
          <div className="problem-status locked">
            <span>🔒 Locked ({formatCountdown(countdown || 0)})</span>
          </div>
        );
      
      case 'unlocked':
        return (
          <div className="problem-status unlocked">
            <span>🔓 Ready to Complete</span>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getActionButtons = (problem) => {
    const status = problemStatus[problem._id];
    
    if (!status) return null;

    switch (status.status) {
      case 'completed':
        return (
          <button className="solve-btn completed" disabled>
            ✅ Completed
          </button>
        );
      
      case 'not_started':
        return (
          <div className="action-buttons">
            <button 
              className="solve-btn start"
              onClick={() => handleStart(problem._id)}
            >
              🚀 Start Problem
            </button>
            <button 
              className="solve-btn external"
              onClick={() => window.open(problem.link || problem.problemLink, '_blank')}
            >
              🔗 Open Link
            </button>
          </div>
        );
      
      case 'locked':
        return (
          <div className="action-buttons">
            <button 
              className="solve-btn stop"
              onClick={() => handleStop(problem._id)}
            >
              ⏸️ Stop Session
            </button>
            <button className="solve-btn locked" disabled>
              🔒 Complete (Locked)
            </button>
          </div>
        );
      
      case 'unlocked':
        return (
          <div className="action-buttons">
            <button 
              className="solve-btn stop"
              onClick={() => handleStop(problem._id)}
            >
              ⏸️ Stop Session
            </button>
            <button 
              className="solve-btn complete"
              onClick={() => handleComplete(problem._id)}
            >
              ✅ Mark Complete
            </button>
          </div>
        );
      
      default:
        return null;
    }
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
            <option value="Easy">🟢 Easy (30 min)</option>
            <option value="Medium">🟡 Medium (40 min)</option>
            <option value="Hard">🔴 Hard (60 min)</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Topic:</label>
          <select
            value={filters.topic}
            onChange={(e) => handleFilterChange('topic', e.target.value)}
          >
            <option value="All">All Topics</option>
            <option value="Arrays">Arrays</option>
            <option value="LinkedList">LinkedList</option>
            <option value="Stack&Queue">Stack & Queue</option>
            <option value="Trees">Trees</option>
            <option value="Graphs">Graphs</option>
            <option value="DP">Dynamic Programming</option>
            <option value="BinarySearch">Binary Search</option>
            <option value="Trie">Trie</option>
            <option value="Heap">Heap</option>
            <option value="Math">Math</option>
            <option value="Greedy">Greedy</option>
            <option value="Bits">Bit Manipulation</option>
          </select>
        </div>
      </div>

      <div className="problems-list">
        {filteredProblems.map(problem => (
          <div key={problem._id} className="problem-card">
            <div className="solve-checkbox">
              <input
                type="checkbox"
                checked={solvedIds.includes(problem._id)}
                disabled={solvedIds.includes(problem._id)}
                onChange={() => handleSolve(problem._id)}
              />
              <label>{solvedIds.includes(problem._id) ? '✔ Solved' : 'Mark as Solved'}</label>
            </div>
            <div className="problem-header">
              <div className="problem-title-section">
                <h3>{problem.title}</h3>
                {getProblemStatusDisplay(problem)}
              </div>
              <span className="difficulty-badge">
                {getDifficultyDisplay(problem.difficulty)}
              </span>
            </div>
            
            <div className="problem-meta">
              <span className="topic">{problem.topic}</span>
              <span className="time-estimate">
                {problem.difficulty === 'Easy' ? '30 min' : 
                 problem.difficulty === 'Medium' ? '40 min' : '60 min'}
              </span>
            </div>
            
            <div className="problem-actions">
              {getActionButtons(problem)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Problems;
