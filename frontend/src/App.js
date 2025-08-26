import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import LeaderboardNew from './pages/LeaderboardNew';
import SolvedProblems from './pages/SolvedProblems';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminProblems from './pages/AdminProblems';
import ProblemForm from './pages/ProblemForm';
import FindUser from './pages/FindUser';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/leaderboard" element={<LeaderboardNew />} />
            <Route path="/solved" element={<SolvedProblems />} />
            <Route path="/profile" element={<Profile />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/problems" element={<AdminProblems />} />
              <Route path="/admin/problems/new" element={<ProblemForm />} />
              <Route path="/admin/problems/edit/:id" element={<ProblemForm />} />
              <Route path="/admin/find-user" element={<FindUser />} />
            </Routes>
          </div>
        </div>
      </Router>
    );
}

export default App;
