import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AuthPage } from './pages/Auth';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BookingsPage } from './pages/admin/BookingsPage';
import { EngineersPage } from './pages/admin/EngineersPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { EngineerDashboard } from './pages/EngineerDashboard';
import { EngineerProfile } from './pages/EngineerProfile';
import { AnimatePresence } from 'framer-motion';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { AdminLayout } from './components/layout/AdminLayout';
import { EngineerLayout } from './components/layout/EngineerLayout';
import { useEffect, useState } from 'react';
import { LandingPage } from './pages/Landing';
import { ResetPassword } from './pages/ResetPassword';

function HashRedirector() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      location.pathname === '/' &&
      location.hash.includes('access_token') &&
      location.hash.includes('type=recovery')
    ) {
      navigate(`/reset-password${location.hash}`);
    }
  }, [location, navigate]);

  return null;
}

export default function App() {
  const { user, initialized, isEngineer, isAdmin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!initialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <HashRedirector />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin routes */}
          {user && isAdmin && (
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="engineers" element={<EngineersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          )}

          {/* Engineer routes */}
          {user && isEngineer && (
            <Route path="/engineer" element={<EngineerLayout />}>
              <Route index element={<EngineerDashboard />} />
              <Route path="profile" element={<EngineerProfile />} />
              <Route path="*" element={<Navigate to="/engineer" replace />} />
            </Route>
          )}

          {/* Fallback */}
          <Route path="*" element={
            user
              ? isAdmin
                ? <Navigate to="/admin" replace />
                : isEngineer
                  ? <Navigate to="/engineer" replace />
                  : <Navigate to="/auth" replace />
              : <Navigate to="/" replace />
          } />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}