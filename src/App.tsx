import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
        {!user ? (
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : isAdmin ? (
          <AdminLayout>
            <Routes>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/bookings" element={<BookingsPage />} />
              <Route path="/admin/engineers" element={<EngineersPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </AdminLayout>
        ) : isEngineer ? (
          <EngineerLayout>
            <Routes>
              <Route path="/engineer/profile" element={<EngineerProfile />} />
              <Route path="*" element={<Navigate to="/engineer/profile" replace />} />
            </Routes>
          </EngineerLayout>
        ) : (
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}