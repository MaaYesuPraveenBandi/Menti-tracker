import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const SimpleProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      console.log('Fetching problems...');
      const res = await api.get('/problems');
      console.log('Problems received:', res.data);
      setProblems(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError(`Error: ${err.response?.data?.msg || err.message}`);
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading problems...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error Loading Problems</h2>
        <p>{error}</p>
        <button onClick={fetchProblems}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple Problems Test</h1>
      <p>Total problems: {problems.length}</p>
      
      {problems.length === 0 ? (
        <p>No problems found</p>
      ) : (
        <div>
          {problems.map(problem => (
            <div key={problem._id} style={{ 
              border: '1px solid #ddd', 
              padding: '10px', 
              margin: '10px 0',
              borderRadius: '5px'
            }}>
              <h3>{problem.title}</h3>
              <p><strong>Difficulty:</strong> {problem.difficulty}</p>
              <p><strong>Category:</strong> {problem.category}</p>
              <p><strong>Points:</strong> {problem.points}</p>
              <p>{problem.description}</p>
              {problem.problemLink && (
                <a href={problem.problemLink} target="_blank" rel="noopener noreferrer">
                  View Problem
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleProblems;
