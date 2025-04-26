import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AuthPage } from './pages/Auth';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BookingsPage } from './pages/admin/BookingsPage';
import { EngineersPage } from './pages/admin/EngineersPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { EngineerDashboard } from './pages/EngineerDashboard'; // This should be your requests page
import { EngineerProfile } from './pages/EngineerProfile';
import { AnimatePresence } from 'framer-motion';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { AdminLayout } from './components/layout/AdminLayout';
import { EngineerLayout } from './components/layout/EngineerLayout';
import { useEffect, useState } from 'react';
import { LandingPage } from './pages/Landing';
import { ResetPassword } from './pages/ResetPassword';

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
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<LandingPage />} />

          {/* Admin routes */}
          {user && isAdmin && (
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/bookings" element={<BookingsPage />} />
              <Route path="/admin/engineers" element={<EngineersPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
            </Route>
          )}

          {/* Engineer routes */}
          {user && isEngineer && (
            <Route element={<EngineerLayout />}>
              <Route index path="/engineer" element={<EngineerDashboard />} /> {/* Requests page */}
              <Route path="/engineer/profile" element={<EngineerProfile />} />
              <Route path="/engineer/*" element={<Navigate to="/engineer" replace />} />
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