import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import ReportItem from './pages/ReportItem';
import MyClaims from './pages/MyClaims';
import ClaimChat from './pages/ClaimChat';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import AdminMatches from './pages/AdminMatches';
import AdminCCTV from './pages/AdminCCTV';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (userProfile?.role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/report"
            element={
              <PrivateRoute>
                <ReportItem />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-claims"
            element={
              <PrivateRoute>
                <MyClaims />
              </PrivateRoute>
            }
          />
          <Route
            path="/claims/:claimId/chat"
            element={
              <PrivateRoute>
                <ClaimChat />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/matches/:itemId"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <AdminMatches />
                </AdminRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/cctv/:claimId"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <AdminCCTV />
                </AdminRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
