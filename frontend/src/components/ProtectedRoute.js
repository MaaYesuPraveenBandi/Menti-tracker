import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

const ProtectedRoute = ({ children, adminRequired = false }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await api.get('/auth/user');
      setIsAuthenticated(true);
      setIsAdmin(res.data?.isAdmin || false);
    } catch (err) {
      console.error('Auth check failed:', err);
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      // Remove invalid token
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#fff'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminRequired && !isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#fff',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2 style={{ color: '#ff8c00', marginBottom: '20px' }}>Access Denied</h2>
        <p style={{ marginBottom: '30px', fontSize: '18px' }}>
          You need admin privileges to access this page.
        </p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px',
            background: 'rgba(255, 140, 0, 0.1)',
            border: '1px solid rgba(255, 140, 0, 0.3)',
            borderRadius: '8px',
            color: '#ff8c00',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
