import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/problems', icon: '💻', label: 'Problems' },
    { path: '/solved', icon: '✅', label: 'Solved' },
    { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  ];

  const adminMenuItems = [
    { path: '/admin/dashboard', icon: '⚙️', label: 'Admin Dashboard' },
    { path: '/admin/problems', icon: '📝', label: 'Manage Problems' },
    { path: '/admin/problems/new', icon: '➕', label: 'Add Problem' }
  ];

  useEffect(() => {
    // Only check admin status if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      checkAdminStatus();
    }
  }, []);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAdmin(false);
        return;
      }

      const res = await api.get('/auth/user');
      setIsAdmin(res.data?.isAdmin || false);
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
      
      // Don't redirect here, let the api interceptor handle auth errors
      if (err.response?.status === 401) {
        // Token is invalid, user will be redirected by api interceptor
        return;
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Don't show sidebar on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-section">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <span className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          {!isCollapsed && <h2 className="brand-title">MentiBY Tracker</h2>}
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </Link>
        ))}
        
        {isAdmin && (
          <>
            {!isCollapsed && (
              <div className="nav-divider">
                <span>Admin Panel</span>
              </div>
            )}
            {adminMenuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item admin-item ${location.pathname === item.path ? 'active' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn" title={isCollapsed ? 'Logout' : ''}>
          {!isCollapsed && <span className="nav-label">Logout</span>}
          <span className="nav-icon">🚪</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
