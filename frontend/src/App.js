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
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/problems" element={
              <ProtectedRoute>
                <Problems />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <LeaderboardNew />
              </ProtectedRoute>
            } />
            <Route path="/solved" element={
              <ProtectedRoute>
                <SolvedProblems />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
              
              {/* Admin Routes - Protected with admin requirement */}
              <Route path="/admin" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/problems" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminProblems />
                </ProtectedRoute>
              } />
              <Route path="/admin/problems/new" element={
                <ProtectedRoute adminRequired={true}>
                  <ProblemForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/problems/edit/:id" element={
                <ProtectedRoute adminRequired={true}>
                  <ProblemForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/find-user" element={
                <ProtectedRoute adminRequired={true}>
                  <FindUser />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </Router>
    );
}

export default App;
