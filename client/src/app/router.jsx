import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import LandingPage from '../features/auth/LandingPage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import RegisterPage from '../features/auth/RegisterPage.jsx';
import DashboardPage from '../features/dashboard/DashboardPage.jsx';
import AnalyticsPage from '../features/analytics/AnalyticsPage.jsx';
import PatternsPage from '../features/analytics/PatternsPage.jsx';
import InsightsPage from '../features/recommendations/InsightsPage.jsx';
import FocusTimerPage from '../features/goals/FocusTimerPage.jsx';
import RecordsPage from '../features/screenTime/RecordsPage.jsx';
import SettingsPage from '../features/settings/SettingsPage.jsx';
import Spinner from '../components/ui/Spinner.jsx';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public-Only Route Wrapper (e.g. login/register redirect to dashboard if logged in)
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Authenticated Dashboard Pages */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/patterns" element={<PatternsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/focus" element={<FocusTimerPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
